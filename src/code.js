/**
 * Figma AI Copilot (bscl) - Motor de Ejecución & Sandbox de Canvas
 * Desarrollado por Brayan Stid Cortés Lombana (bscl)
 * 
 * Gestiona la interacción con la Figma Plugin API, escucha de eventos,
 * carga de fuentes y ejecución de operaciones DSL de diseño generativo.
 */

// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE UI
// ==========================================
figma.showUI(__html__, {
  width: 380,
  height: 620,
  themeColors: true
});

// ==========================================
// 2. HELPERS: FUENTES, COLORES Y SERIALIZACIÓN
// ==========================================

/**
 * Carga de fuentes segura con fallbacks automáticos (Inter / Roboto).
 */
async function ensureFontLoaded(family = 'Inter', style = 'Regular') {
  const safeFamily = family || 'Inter';
  const safeStyle = style || 'Regular';
  try {
    const font = { family: safeFamily, style: safeStyle };
    await figma.loadFontAsync(font);
    return font;
  } catch (err) {
    console.warn(`[Figma AI Copilot] Fallback para fuente ${safeFamily} ${safeStyle}:`, err);
    try {
      const fallback = { family: 'Inter', style: 'Regular' };
      await figma.loadFontAsync(fallback);
      return fallback;
    } catch {
      const roboto = { family: 'Roboto', style: 'Regular' };
      await figma.loadFontAsync(roboto);
      return roboto;
    }
  }
}

/**
 * Convierte código hexadecimal (#RRGGBB o #RGB) a objeto RGB normalizado (0-1).
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0.1, g: 0.1, b: 0.1 };
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return { r: 0.2, g: 0.2, b: 0.2 };
  const num = parseInt(clean, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

/**
 * Normaliza cualquier entrada de color (string hex, objeto rgb 0-255 o 0-1).
 */
function parseColor(input) {
  if (!input) return { r: 0.2, g: 0.2, b: 0.2 };
  if (typeof input === 'string') return hexToRgb(input);
  if (typeof input === 'object') {
    if ('r' in input && 'g' in input && 'b' in input) {
      return {
        r: input.r > 1 ? input.r / 255 : input.r,
        g: input.g > 1 ? input.g / 255 : input.g,
        b: input.b > 1 ? input.b / 255 : input.b
      };
    }
  }
  return { r: 0.2, g: 0.2, b: 0.2 };
}

/**
 * Genera array de fills Figma Paint a partir de colores o paints.
 */
function parseFills(fills) {
  if (!fills) return [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  if (Array.isArray(fills)) {
    return fills.map(f => {
      if (f && f.type === 'SOLID' && f.color) return f;
      return { type: 'SOLID', color: parseColor(f) };
    });
  }
  const color = parseColor(fills);
  const opacity = typeof fills === 'object' && fills.opacity != null ? fills.opacity : 1;
  return [{ type: 'SOLID', color, opacity }];
}

/**
 * Serializa de forma segura un nodo de Figma para transmisión a la UI.
 */
function serializeNode(node) {
  if (!node) return null;
  const item = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width),
    height: Math.round(node.height),
    visible: node.visible,
    opacity: node.opacity
  };
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
    item.cornerRadius = node.cornerRadius;
  }
  if ('fills' in node && Array.isArray(node.fills)) {
    item.fills = node.fills;
  }
  if ('layoutMode' in node) {
    item.layoutMode = node.layoutMode;
  }
  if (node.type === 'TEXT') {
    item.characters = node.characters;
    item.fontSize = typeof node.fontSize === 'number' ? node.fontSize : 14;
  }
  return item;
}

/**
 * Envía la selección actual del lienzo a la UI del plugin.
 */
function broadcastSelection() {
  const selection = figma.currentPage.selection.map(serializeNode).filter(Boolean);
  figma.ui.postMessage({
    type: 'SELECTION_CHANGE',
    selection,
    count: selection.length
  });
}

/**
 * Normaliza cualquier objeto de operación desempaquetando params y action/type.
 */
function normalizeOperation(rawOp) {
  if (!rawOp || typeof rawOp !== 'object') return {};
  const params = rawOp.params && typeof rawOp.params === 'object' ? rawOp.params : {};
  const merged = { ...rawOp, ...params };
  merged.action = (merged.action || merged.type || '').toUpperCase();
  return merged;
}

/**
 * Aplica trazos (bordes) y sombras (drop-shadow) a un nodo si están presentes en la operación.
 */
function applyStrokesAndEffects(node, op) {
  // Bordes / Strokework
  if (op.strokes || op.borderColor) {
    node.strokes = parseFills(op.strokes || op.borderColor);
    node.strokeWeight = Number(op.strokeWeight ?? op.borderWidth ?? 1);
    if (op.strokeAlign) {
      const align = String(op.strokeAlign).toUpperCase();
      if (['INSIDE', 'OUTSIDE', 'CENTER'].includes(align)) {
        node.strokeAlign = align;
      }
    }
  }

  // Efectos / Sombras
  if (op.effects && Array.isArray(op.effects)) {
    node.effects = op.effects;
  } else if (op.dropShadow || op.shadow) {
    const s = typeof op.dropShadow === 'object' ? op.dropShadow : {};
    node.effects = [{
      type: 'DROP_SHADOW',
      color: s.color ? { ...parseColor(s.color), a: s.opacity ?? 0.15 } : { r: 0, g: 0, b: 0, a: 0.18 },
      offset: { x: Number(s.x ?? 0), y: Number(s.y ?? 4) },
      radius: Number(s.blur ?? s.radius ?? 12),
      spread: Number(s.spread ?? 0),
      visible: true,
      blendMode: 'NORMAL'
    }];
  }
}

// ==========================================
// 3. MANEJADORES DE OPERACIONES DSL
// ==========================================

async function opCreateFrame(op, parent) {
  const frame = figma.createFrame();
  frame.name = op.name || 'Frame';
  frame.resize(Math.max(1, op.width || 320), Math.max(1, op.height || 200));

  if (op.cornerRadius != null) frame.cornerRadius = Number(op.cornerRadius);
  if (op.fills !== undefined) frame.fills = parseFills(op.fills);

  applyStrokesAndEffects(frame, op);

  const mode = (op.layoutMode || '').toUpperCase();
  if (mode === 'HORIZONTAL' || mode === 'VERTICAL') {
    frame.layoutMode = mode;
    if (op.itemSpacing != null) frame.itemSpacing = Number(op.itemSpacing);

    const pad = op.padding;
    const defaultPad = typeof pad === 'number' ? pad : 0;
    frame.paddingTop = op.paddingTop ?? pad?.top ?? defaultPad;
    frame.paddingRight = op.paddingRight ?? pad?.right ?? defaultPad;
    frame.paddingBottom = op.paddingBottom ?? pad?.bottom ?? defaultPad;
    frame.paddingLeft = op.paddingLeft ?? pad?.left ?? defaultPad;

    if (op.primaryAxisAlignItems) frame.primaryAxisAlignItems = op.primaryAxisAlignItems.toUpperCase();
    if (op.counterAxisAlignItems) frame.counterAxisAlignItems = op.counterAxisAlignItems.toUpperCase();
  } else {
    frame.layoutMode = 'NONE';
  }

  if (op.clipsContent != null) frame.clipsContent = Boolean(op.clipsContent);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(frame);

  if (op.x != null && op.y != null) {
    frame.x = Number(op.x);
    frame.y = Number(op.y);
  } else if (!parent) {
    const center = figma.viewport.center;
    frame.x = Math.round(center.x - frame.width / 2);
    frame.y = Math.round(center.y - frame.height / 2);
  }

  // Creación recursiva de hijos
  if (Array.isArray(op.children) && op.children.length > 0) {
    for (const childOp of op.children) {
      await executeSingleOperation(childOp, frame);
    }
  }

  return frame;
}

/**
 * Crea un Botón nativo de Figma con Auto-Layout, texto y estilos modernos.
 */
async function opCreateButton(op, parent) {
  const button = figma.createFrame();
  button.name = op.name || 'Button';
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisAlignItems = 'CENTER';
  button.counterAxisAlignItems = 'CENTER';
  button.primaryAxisSizingMode = op.width ? 'FIXED' : 'AUTO';
  button.counterAxisSizingMode = op.height ? 'FIXED' : 'AUTO';

  if (op.width) button.resize(Math.max(1, op.width), button.height);
  if (op.height) button.resize(button.width, Math.max(1, op.height));

  const padH = Number(op.paddingX ?? op.paddingHorizontal ?? 16);
  const padV = Number(op.paddingY ?? op.paddingVertical ?? 10);
  button.paddingLeft = padH;
  button.paddingRight = padH;
  button.paddingTop = padV;
  button.paddingBottom = padV;
  button.itemSpacing = Number(op.itemSpacing ?? 8);
  button.cornerRadius = Number(op.cornerRadius ?? 8);

  // Color de fondo
  const variant = (op.variant || 'PRIMARY').toUpperCase();
  if (op.fills !== undefined) {
    button.fills = parseFills(op.fills);
  } else if (variant === 'SECONDARY') {
    button.fills = parseFills('#21262D');
  } else if (variant === 'OUTLINE') {
    button.fills = [];
  } else if (variant === 'GITHUB') {
    button.fills = parseFills('#238636'); // Verde GitHub oficial
  } else {
    button.fills = parseFills(op.backgroundColor || '#6366F1'); // Indigo/Primary
  }

  applyStrokesAndEffects(button, op);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(button);

  // Crear texto hijo dentro del botón
  const text = figma.createText();
  text.name = 'Label';
  const font = await ensureFontLoaded(op.fontFamily || 'Inter', op.fontWeight === 'BOLD' ? 'Bold' : 'Medium');
  text.fontName = font;
  text.characters = String(op.label ?? op.text ?? op.title ?? 'Button');
  text.fontSize = Number(op.fontSize ?? 14);

  const textFill = op.textColor || (variant === 'OUTLINE' ? '#FFFFFF' : '#FFFFFF');
  text.fills = parseFills(textFill);
  button.appendChild(text);

  if (op.x != null && op.y != null) {
    button.x = Number(op.x);
    button.y = Number(op.y);
  }

  return button;
}

/**
 * Crea un Componente Maestro con Variantes interactivas (Default, Hover, Pressed)
 * y configura prototipado nativo de Figma (While hovering, On click).
 */
async function opCreateInteractiveComponentSet(op, parent) {
  const compDefault = figma.createComponent();
  compDefault.name = 'State=Default';
  compDefault.layoutMode = 'HORIZONTAL';
  compDefault.primaryAxisAlignItems = 'CENTER';
  compDefault.counterAxisAlignItems = 'CENTER';
  compDefault.primaryAxisSizingMode = 'AUTO';
  compDefault.counterAxisSizingMode = 'AUTO';
  compDefault.paddingLeft = Number(op.paddingX ?? 18);
  compDefault.paddingRight = Number(op.paddingX ?? 18);
  compDefault.paddingTop = Number(op.paddingY ?? 10);
  compDefault.paddingBottom = Number(op.paddingY ?? 10);
  compDefault.cornerRadius = Number(op.cornerRadius ?? 8);
  
  const baseColor = op.baseColor || op.backgroundColor || '#005F73';
  compDefault.fills = parseFills(baseColor);
  applyStrokesAndEffects(compDefault, op);

  const textDef = figma.createText();
  textDef.name = 'Label';
  const font = await ensureFontLoaded(op.fontFamily || 'Inter', 'Bold');
  textDef.fontName = font;
  textDef.characters = String(op.label ?? op.text ?? 'Botón Interactivo');
  textDef.fontSize = Number(op.fontSize ?? 14);
  textDef.fills = parseFills(op.textColor || '#FFFFFF');
  compDefault.appendChild(textDef);

  // Variante 2: Hover (color más claro o brillante)
  const compHover = figma.createComponent();
  compHover.name = 'State=Hover';
  compHover.layoutMode = 'HORIZONTAL';
  compHover.primaryAxisAlignItems = 'CENTER';
  compHover.counterAxisAlignItems = 'CENTER';
  compHover.primaryAxisSizingMode = 'AUTO';
  compHover.counterAxisSizingMode = 'AUTO';
  compHover.paddingLeft = Number(op.paddingX ?? 18);
  compHover.paddingRight = Number(op.paddingX ?? 18);
  compHover.paddingTop = Number(op.paddingY ?? 10);
  compHover.paddingBottom = Number(op.paddingY ?? 10);
  compHover.cornerRadius = Number(op.cornerRadius ?? 8);
  
  const hoverColor = op.hoverColor || '#0A9396';
  compHover.fills = parseFills(hoverColor);
  applyStrokesAndEffects(compHover, op);

  const textHov = figma.createText();
  textHov.name = 'Label';
  textHov.fontName = font;
  textHov.characters = textDef.characters;
  textHov.fontSize = textDef.fontSize;
  textHov.fills = parseFills(op.textColor || '#FFFFFF');
  compHover.appendChild(textHov);

  // Combinar como ComponentSet de Figma (Variantes)
  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(compDefault);
  targetParent.appendChild(compHover);

  const componentSet = figma.combineAsVariants([compDefault, compHover], targetParent);
  componentSet.name = op.name || 'Interactive Button';

  // Añadir interacción de prototipado nativa en Figma (WHILE_HOVERING)
  try {
    compDefault.setReactions([
      {
        trigger: { type: 'WHILE_HOVERING' },
        actions: [
          {
            type: 'NODE',
            destinationId: compHover.id,
            navigation: 'CHANGE_TO',
            transition: {
              type: 'SMART_ANIMATE',
              easing: { type: 'EASE_OUT' },
              duration: 0.2
            }
          }
        ]
      }
    ]);
  } catch (protoErr) {
    console.warn('[Figma AI Copilot] No se pudo configurar la reacción de prototipado automática:', protoErr);
  }

  return componentSet;
}

/**
 * Crea una Badge / Etiqueta tipo píldora (ej: "Beta", "Public", "v1.0.0").
 */
async function opCreateBadge(op, parent) {
  const badge = figma.createFrame();
  badge.name = op.name || 'Badge';
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'AUTO';
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.paddingTop = 3;
  badge.paddingBottom = 3;
  badge.cornerRadius = Number(op.cornerRadius ?? 999);
  badge.fills = parseFills(op.fills || op.backgroundColor || 'rgba(99, 102, 241, 0.15)');

  applyStrokesAndEffects(badge, op);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(badge);

  const text = figma.createText();
  text.name = 'BadgeText';
  const font = await ensureFontLoaded(op.fontFamily || 'Inter', 'Medium');
  text.fontName = font;
  text.characters = String(op.text ?? op.label ?? 'Badge');
  text.fontSize = Number(op.fontSize ?? 11);
  text.fills = parseFills(op.textColor || '#A5B4FC');
  badge.appendChild(text);

  return badge;
}

/**
 * Crea un Input / Campo de texto para formularios con placeholder.
 */
async function opCreateInput(op, parent) {
  const input = figma.createFrame();
  input.name = op.name || 'InputField';
  input.layoutMode = 'HORIZONTAL';
  input.primaryAxisAlignItems = 'MIN';
  input.counterAxisAlignItems = 'CENTER';
  input.resize(Math.max(1, op.width || 280), Math.max(1, op.height || 42));
  input.paddingLeft = 12;
  input.paddingRight = 12;
  input.cornerRadius = Number(op.cornerRadius ?? 6);
  input.fills = parseFills(op.fills || op.backgroundColor || '#0D1117');
  
  if (!op.strokes && !op.borderColor) {
    input.strokes = parseFills('#30363D');
    input.strokeWeight = 1;
  } else {
    applyStrokesAndEffects(input, op);
  }

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(input);

  const text = figma.createText();
  text.name = 'Placeholder';
  const font = await ensureFontLoaded(op.fontFamily || 'Inter', 'Regular');
  text.fontName = font;
  text.characters = String(op.placeholder ?? op.text ?? 'Introduce un valor...');
  text.fontSize = Number(op.fontSize ?? 13);
  text.fills = parseFills('#8B949E');
  input.appendChild(text);

  return input;
}

async function opCreateText(op, parent) {
  const text = figma.createText();
  text.name = op.name || 'Text';

  const font = await ensureFontLoaded(op.fontFamily || op.family, op.fontStyle || op.style);
  text.fontName = font;
  text.characters = String(op.characters ?? op.text ?? 'Texto');

  if (op.fontSize != null) text.fontSize = Number(op.fontSize);
  if (op.fontColor != null || op.fills != null) text.fills = parseFills(op.fontColor ?? op.fills);

  if (op.textAlign) {
    const align = op.textAlign.toUpperCase();
    if (['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED'].includes(align)) {
      text.textAlignHorizontal = align;
    }
  }

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(text);

  if (op.x != null) text.x = Number(op.x);
  if (op.y != null) text.y = Number(op.y);

  return text;
}

// Catálogo de iconos vectoriales Bootstrap Icons optimizados para Figma
const BOOTSTRAP_ICONS = {
  // Navegación y UI
  'house': '<path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>',
  'search': '<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>',
  'bell': '<path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>',
  'person': '<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>',
  'gear': '<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>',
  
  // SafeRoute y Mapas
  'shield-check': '<path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.55 3.998-.08 7.904 1.745 11.238a.5.5 0 0 0 .428.286c.64.07 1.28.114 1.92.133a46 46 0 0 0 1.918-.133.5.5 0 0 0 .428-.286c1.824-3.334 2.294-7.24 1.745-11.238a.48.48 0 0 0-.328-.39c-.933-.284-1.88-.57-2.837-.856a.5.5 0 0 0-.286 0zm5.523 5.48a.5.5 0 0 1 .123.593l-2.5 4.5a.5.5 0 0 1-.803.111l-1.5-1.5a.5.5 0 1 1 .707-.707l1.096 1.096 2.17-3.906a.5.5 0 0 1 .707-.187"/>',
  'geo-alt': '<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4"/>',
  'telephone': '<path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z"/>',
  'exclamation-triangle': '<path d="M7.938 2.016a.13.13 0 0 1 .125 0l6.857 11.656c.028.05.028.11 0 .16s-.08.08-.125.08H1.205c-.045 0-.097-.03-.125-.08s-.028-.11 0-.16zM8 0c-.27 0-.527.14-.656.36L.487 12.016C.358 12.236.358 12.51.487 12.73s.386.36.656.36h13.714c.27 0 .527-.14.656-.36s.129-.494 0-.714L8.656.36A.75.75 0 0 0 8 0M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.55.55 0 0 1-1.1 0z"/>',
  'heart': '<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>',
  
  // Flechas y Acciones
  'arrow-left': '<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>',
  'arrow-right': '<path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>',
  'plus': '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>',
  'check-circle': '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>',
  'lock': '<path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>',
  'envelope': '<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>'
};

/**
 * Crea un Icono Vectorial nativo de Bootstrap Icons en Figma.
 */
async function opCreateIcon(op, parent) {
  const iconName = (op.icon || op.name || 'house').toLowerCase();
  const colorHex = op.color || op.fill || '#005F73';
  const size = Math.max(8, Number(op.size || 24));
  const svgPath = BOOTSTRAP_ICONS[iconName] || BOOTSTRAP_ICONS['shield-check'] || BOOTSTRAP_ICONS['house'];

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${colorHex}" viewBox="0 0 16 16">${svgPath}</svg>`;
  
  const iconNode = figma.createNodeFromSvg(svgContent);
  iconNode.name = `Icon/${iconName}`;
  
  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(iconNode);

  if (op.x != null && op.y != null) {
    iconNode.x = Number(op.x);
    iconNode.y = Number(op.y);
  }

  return iconNode;
}
  if (op.fills !== undefined) rect.fills = parseFills(op.fills);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(rect);

  if (op.x != null) rect.x = Number(op.x);
  if (op.y != null) rect.y = Number(op.y);

  return rect;
}

async function opCreateEllipse(op, parent) {
  const ellipse = figma.createEllipse();
  ellipse.name = op.name || 'Ellipse';
  ellipse.resize(Math.max(1, op.width || 80), Math.max(1, op.height || 80));

  if (op.fills !== undefined) ellipse.fills = parseFills(op.fills);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(ellipse);

  if (op.x != null) ellipse.x = Number(op.x);
  if (op.y != null) ellipse.y = Number(op.y);

  return ellipse;
}

async function opEditNode(op) {
  const target = op.nodeId ? figma.getNodeById(op.nodeId) : figma.currentPage.selection[0];
  if (!target) throw new Error(`Nodo no encontrado para EDIT_NODE: ${op.nodeId || 'selección vacía'}`);

  if (op.name) target.name = op.name;
  if (op.width != null || op.height != null) {
    const w = op.width ?? target.width;
    const h = op.height ?? target.height;
    if ('resize' in target) target.resize(w, h);
  }
  if (op.cornerRadius != null && 'cornerRadius' in target) {
    target.cornerRadius = Number(op.cornerRadius);
  }
  if (op.fills !== undefined && 'fills' in target) {
    target.fills = parseFills(op.fills);
  }
  if ((op.characters != null || op.text != null) && target.type === 'TEXT') {
    if (typeof target.fontName === 'symbol') {
      await ensureFontLoaded('Inter', 'Regular');
      target.fontName = { family: 'Inter', style: 'Regular' };
    } else {
      await figma.loadFontAsync(target.fontName);
    }
    target.characters = String(op.characters ?? op.text);
  }
  if (op.fontSize != null && target.type === 'TEXT') {
    target.fontSize = Number(op.fontSize);
  }
  if (op.opacity != null && 'opacity' in target) {
    target.opacity = Math.max(0, Math.min(1, Number(op.opacity)));
  }
  if (op.visible != null && 'visible' in target) {
    target.visible = Boolean(op.visible);
  }

  return target;
}

async function opApplyAutoLayout(op) {
  let frame;
  const target = op.nodeId ? figma.getNodeById(op.nodeId) : figma.currentPage.selection[0];

  if (target && target.type === 'FRAME') {
    frame = target;
  } else {
    const selection = op.nodeId ? [figma.getNodeById(op.nodeId)].filter(Boolean) : [...figma.currentPage.selection];
    if (selection.length === 0) throw new Error('No hay capas seleccionadas para aplicar Auto-Layout.');

    frame = figma.createFrame();
    frame.name = op.name || 'AutoLayout Frame';
    const first = selection[0];
    const parent = first.parent || figma.currentPage;
    parent.appendChild(frame);
    frame.x = first.x;
    frame.y = first.y;
    frame.fills = op.fills ? parseFills(op.fills) : [];

    for (const item of selection) {
      frame.appendChild(item);
    }
  }

  const dir = (op.direction || op.layoutMode || 'VERTICAL').toUpperCase();
  frame.layoutMode = dir === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';

  if (op.itemSpacing != null) frame.itemSpacing = Number(op.itemSpacing);

  const pad = op.padding;
  const defaultPad = typeof pad === 'number' ? pad : 0;
  frame.paddingTop = op.paddingTop ?? pad?.top ?? defaultPad;
  frame.paddingRight = op.paddingRight ?? pad?.right ?? defaultPad;
  frame.paddingBottom = op.paddingBottom ?? pad?.bottom ?? defaultPad;
  frame.paddingLeft = op.paddingLeft ?? pad?.left ?? defaultPad;

  if (op.primaryAxisAlignItems) frame.primaryAxisAlignItems = op.primaryAxisAlignItems.toUpperCase();
  if (op.counterAxisAlignItems) frame.counterAxisAlignItems = op.counterAxisAlignItems.toUpperCase();

  return frame;
}

async function opAlignSelection(op) {
  const nodes = op.nodeIds ? op.nodeIds.map(id => figma.getNodeById(id)).filter(Boolean) : [...figma.currentPage.selection];
  if (nodes.length < 2) throw new Error('Se requieren al menos 2 elementos seleccionados para alinear.');

  const direction = (op.direction || 'ROW').toUpperCase();
  const spacing = Number(op.spacing ?? 16);

  if (direction === 'ROW' || direction === 'HORIZONTAL') {
    nodes.sort((a, b) => a.x - b.x);
    let curX = nodes[0].x;
    const baseVal = nodes[0].y;
    for (const node of nodes) {
      node.x = curX;
      if (op.alignCross === 'CENTER') node.y = baseVal + (nodes[0].height - node.height) / 2;
      curX += node.width + spacing;
    }
  } else if (direction === 'COLUMN' || direction === 'VERTICAL') {
    nodes.sort((a, b) => a.y - b.y);
    let curY = nodes[0].y;
    const baseVal = nodes[0].x;
    for (const node of nodes) {
      node.y = curY;
      if (op.alignCross === 'CENTER') node.x = baseVal + (nodes[0].width - node.width) / 2;
      curY += node.height + spacing;
    }
  } else if (direction === 'GRID') {
    const cols = Math.max(1, Number(op.cols || 2));
    const startX = nodes[0].x;
    const startY = nodes[0].y;
    const colWidth = Math.max(...nodes.map(n => n.width));
    const rowHeight = Math.max(...nodes.map(n => n.height));
    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      node.x = startX + col * (colWidth + spacing);
      node.y = startY + row * (rowHeight + spacing);
    });
  }

  return nodes[0];
}

async function opRenameNodes(op) {
  const nodes = op.nodeIds ? op.nodeIds.map(id => figma.getNodeById(id)).filter(Boolean) : [...figma.currentPage.selection];
  if (nodes.length === 0) throw new Error('No hay capas seleccionadas para renombrar.');

  const pattern = op.newName || op.name || 'Layer';
  nodes.forEach((node, idx) => {
    node.name = pattern.replace('{i}', String(idx + 1)).replace('{n}', String(node.name));
  });

  return nodes[0];
}

// ==========================================
// 4. DISPATCHER DE OPERACIONES DSL
// ==========================================

async function executeSingleOperation(rawOp, parent = null) {
  const op = normalizeOperation(rawOp);
  const action = op.action;

  switch (action) {
    case 'CREATE_FRAME':
      return await opCreateFrame(op, parent);
    case 'CREATE_BUTTON':
      return await opCreateButton(op, parent);
    case 'CREATE_ICON':
      return await opCreateIcon(op, parent);
    case 'CREATE_COMPONENT_SET':
    case 'CREATE_INTERACTIVE_BUTTON':
      return await opCreateInteractiveComponentSet(op, parent);
    case 'CREATE_BADGE':
      return await opCreateBadge(op, parent);
    case 'CREATE_INPUT':
      return await opCreateInput(op, parent);
    case 'CREATE_TEXT':
      return await opCreateText(op, parent);
    case 'CREATE_RECTANGLE':
      return await opCreateRectangle(op, parent);
    case 'CREATE_ELLIPSE':
      return await opCreateEllipse(op, parent);
    case 'EDIT_NODE':
    case 'MODIFY_NODE':
      return await opEditNode(op);
    case 'APPLY_AUTOLAYOUT':
    case 'SET_AUTO_LAYOUT':
      return await opApplyAutoLayout(op);
    case 'ALIGN_SELECTION':
      return await opAlignSelection(op);
    case 'RENAME_NODES':
      return await opRenameNodes(op);
    default:
      console.warn(`[Figma AI Copilot] Acción desconocida o genérica: "${action}". Intentando como FRAME.`);
      return await opCreateFrame(op, parent);
  }
}

async function executeDsl(payload) {
  const operations = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.operations)
    ? payload.operations
    : [payload];

  const affectedNodes = [];

  for (const op of operations) {
    if (!op || typeof op !== 'object') continue;
    const node = await executeSingleOperation(op);
    if (node && 'id' in node) {
      affectedNodes.push(node);
    }
  }

  // Foco y selección en el lienzo si se crearon o modificaron nodos
  if (affectedNodes.length > 0) {
    figma.currentPage.selection = affectedNodes;
    figma.viewport.scrollAndZoomIntoView(affectedNodes);
  }

  return affectedNodes;
}

// ==========================================
// 5. EVENTOS Y MENSAJERÍA BIDIRECCIONAL
// ==========================================

figma.on('selectionchange', () => {
  broadcastSelection();
});

figma.ui.onmessage = async (msg) => {
  if (!msg || typeof msg !== 'object') return;

  try {
    switch (msg.type) {
      case 'EXECUTE_DSL': {
        const payload = msg.payload || msg.operations || msg.data;
        const resultNodes = await executeDsl(payload);
        figma.ui.postMessage({
          type: 'DSL_RESULT',
          status: 'success',
          message: `Ejecución DSL exitosa (${resultNodes.length} nodos procesados)`,
          nodes: resultNodes.map(serializeNode).filter(Boolean)
        });
        figma.notify('✨ Diseño generado con éxito');
        break;
      }

      case 'GET_SELECTION': {
        broadcastSelection();
        break;
      }

      case 'EXPORT_SELECTION_IMAGE': {
        const selection = figma.currentPage.selection;
        if (!selection || selection.length === 0) {
          figma.ui.postMessage({
            type: 'SELECTION_IMAGE_ERROR',
            error: 'No hay ninguna capa seleccionada en Figma para exportar como imagen.'
          });
          figma.notify('⚠️ Por favor selecciona una capa o imagen primero', { error: true });
          break;
        }

        const targetNode = selection[0];
        try {
          // Exportar el nodo seleccionado a PNG
          const bytes = await targetNode.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: Math.min(2, Math.max(0.5, 800 / Math.max(targetNode.width, targetNode.height))) }
          });

          // Convertir bytes (Uint8Array) a base64
          let binary = '';
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = figma.base64Encode ? figma.base64Encode(bytes) : null;

          figma.ui.postMessage({
            type: 'SELECTION_IMAGE_DATA',
            base64: base64,
            bytes: base64 ? null : Array.from(bytes),
            mimeType: 'image/png',
            nodeName: targetNode.name,
            width: targetNode.width,
            height: targetNode.height
          });
          figma.notify('📸 Imagen capturada para análisis');
        } catch (err) {
          figma.ui.postMessage({
            type: 'SELECTION_IMAGE_ERROR',
            error: `Error exportando imagen de la capa: ${err.message}`
          });
        }
        break;
      }

      case 'NOTIFY': {
        figma.notify(msg.message || '', {
          timeout: msg.timeout || 3000,
          error: Boolean(msg.error)
        });
        break;
      }

      case 'CLOSE': {
        figma.closePlugin();
        break;
      }

      default:
        // Soporte si se envía la acción directamente en msg.type o msg.action
        if (msg.action) {
          const resultNodes = await executeDsl([msg]);
          figma.ui.postMessage({
            type: 'DSL_RESULT',
            status: 'success',
            nodes: resultNodes.map(serializeNode).filter(Boolean)
          });
        }
    }
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('[Figma AI Copilot] Error en ejecución:', error);
    figma.ui.postMessage({
      type: 'DSL_RESULT',
      status: 'error',
      message: errMessage
    });
    figma.notify(`❌ Error: ${errMessage}`, { error: true });
  }
};

// Transmisión inicial de selección al abrir el plugin
broadcastSelection();
