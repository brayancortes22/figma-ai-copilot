/**
 * Figma AI Copilot - Helpers de Canvas, Fuentes y Estilos
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export async function ensureFontLoaded(family = 'Inter', style = 'Regular') {
  const safeFamily = family || 'Inter';
  const safeStyle = style || 'Regular';
  try {
    const font = { family: safeFamily, style: safeStyle };
    await figma.loadFontAsync(font);
    return font;
  } catch (err) {
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

export function hexToRgb(hex) {
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

export function parseColor(input) {
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

export function parseFills(fills) {
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

export function applyStrokesAndEffects(node, op) {
  if (op.opacity != null && 'opacity' in node) {
    const rawOp = Number(op.opacity);
    node.opacity = rawOp > 1 ? rawOp / 100 : Math.max(0, Math.min(1, rawOp));
  }

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

  if (op.effects && Array.isArray(op.effects)) {
    node.effects = op.effects;
  } else {
    const effs = [];
    if (op.dropShadow || op.shadow) {
      const s = typeof op.dropShadow === 'object' ? op.dropShadow : {};
      effs.push({
        type: 'DROP_SHADOW',
        color: s.color ? { ...parseColor(s.color), a: s.opacity ?? 0.15 } : { r: 0, g: 0, b: 0, a: 0.18 },
        offset: { x: Number(s.x ?? 0), y: Number(s.y ?? 4) },
        radius: Number(s.blur ?? s.radius ?? 12),
        spread: Number(s.spread ?? 0),
        visible: true,
        blendMode: 'NORMAL'
      });
    }
    if (op.innerShadow) {
      const is = typeof op.innerShadow === 'object' ? op.innerShadow : {};
      effs.push({
        type: 'INNER_SHADOW',
        color: is.color ? { ...parseColor(is.color), a: is.opacity ?? 0.2 } : { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: Number(is.x ?? 0), y: Number(is.y ?? 2) },
        radius: Number(is.blur ?? is.radius ?? 4),
        spread: Number(is.spread ?? 0),
        visible: true,
        blendMode: 'NORMAL'
      });
    }
    if (op.backgroundBlur || op.glass) {
      const r = typeof op.backgroundBlur === 'number' ? op.backgroundBlur : 16;
      effs.push({ type: 'BACKGROUND_BLUR', radius: r, visible: true });
    } else if (op.layerBlur) {
      const r = typeof op.layerBlur === 'number' ? op.layerBlur : 12;
      effs.push({ type: 'LAYER_BLUR', radius: r, visible: true });
    }
    if (effs.length > 0) node.effects = effs;
  }
}

export function serializeNode(node) {
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

export function normalizeOperation(rawOp) {
  if (!rawOp || typeof rawOp !== 'object') return {};
  const params = rawOp.params && typeof rawOp.params === 'object' ? rawOp.params : {};
  const props = rawOp.properties && typeof rawOp.properties === 'object' ? rawOp.properties : {};
  const merged = { ...rawOp, ...props, ...params };

  if (merged.size && typeof merged.size === 'object') {
    if (merged.size.width) merged.width = merged.size.width;
    if (merged.size.height) merged.height = merged.size.height;
  }
  if (merged.backgroundColor && !merged.fills) {
    merged.fills = [merged.backgroundColor];
  }

  let act = String(merged.action || merged.type || merged.name || '').toUpperCase().trim();
  act = act.replace(/[^A-Z0-9_]/g, '_').replace(/__+/g, '_');

  if (act.includes('FRAME')) merged.action = 'CREATE_FRAME';
  else if (act.includes('BUTTON')) merged.action = 'CREATE_BUTTON';
  else if (act.includes('INPUT')) merged.action = 'CREATE_INPUT';
  else if (act.includes('BADGE')) merged.action = 'CREATE_BADGE';
  else if (act.includes('TEXT')) merged.action = 'CREATE_TEXT';
  else if (act.includes('RECT')) merged.action = 'CREATE_RECTANGLE';
  else if (act.includes('ELLIPSE') || act.includes('CIRCLE')) merged.action = 'CREATE_ELLIPSE';
  else if (act.includes('ICON')) merged.action = 'CREATE_ICON';
  else merged.action = act || 'CREATE_FRAME';

  return merged;
}
