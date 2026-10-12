/**
 * Figma AI Copilot - Primitivas Gráficas (Rectángulo, Elipse, Texto, Iconos)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { parseFills, ensureFontLoaded, applyStrokesAndEffects } from '../helpers.js';
import { BOOTSTRAP_ICONS } from '../icons.js';

export async function opCreateRectangle(op, parent) {
  const rect = figma.createRectangle();
  rect.name = op.name || 'Rectangle';
  rect.resize(Math.max(1, op.width || 120), Math.max(1, op.height || 80));

  if (op.cornerRadius != null) rect.cornerRadius = Number(op.cornerRadius);
  if (op.fills !== undefined) rect.fills = parseFills(op.fills);
  applyStrokesAndEffects(rect, op);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(rect);

  if (op.x != null) rect.x = Number(op.x);
  if (op.y != null) rect.y = Number(op.y);

  return rect;
}

export async function opCreateEllipse(op, parent) {
  const ellipse = figma.createEllipse();
  ellipse.name = op.name || 'Ellipse';
  ellipse.resize(Math.max(1, op.width || 80), Math.max(1, op.height || 80));

  if (op.fills !== undefined) ellipse.fills = parseFills(op.fills);
  applyStrokesAndEffects(ellipse, op);

  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(ellipse);

  if (op.x != null) ellipse.x = Number(op.x);
  if (op.y != null) ellipse.y = Number(op.y);

  return ellipse;
}

export async function opCreateText(op, parent) {
  const text = figma.createText();
  text.name = op.name || 'Text';

  const font = await ensureFontLoaded(op.fontFamily || op.family, op.fontStyle || op.style);
  text.fontName = font;
  text.characters = String(op.characters ?? op.text ?? 'Texto');

  if (op.fontSize != null) text.fontSize = Number(op.fontSize);
  if (op.fontColor != null || op.fills != null) text.fills = parseFills(op.fontColor ?? op.fills);

  if (op.textAlign) {
    const align = String(op.textAlign).toUpperCase();
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

export async function opCreateIcon(op, parent) {
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
