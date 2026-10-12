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

async function opCreateRectangle(op, parent) {
  const rect = figma.createRectangle();
  rect.name = op.name || 'Rectangle';
  rect.resize(Math.max(1, op.width || 120), Math.max(1, op.height || 80));

  if (op.cornerRadius != null) rect.cornerRadius = Number(op.cornerRadius);
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
