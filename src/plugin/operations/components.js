/**
 * Figma AI Copilot - Componentes UI (Botones, Badges, Inputs, ComponentSets)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { parseFills, ensureFontLoaded, applyStrokesAndEffects } from '../helpers.js';
import { opCreateIcon } from './primitives.js';

export async function opCreateButton(op, parent) {
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

  const variant = String(op.variant || 'PRIMARY').toUpperCase();
  if (op.fills !== undefined) {
    button.fills = parseFills(op.fills);
  } else if (variant === 'SECONDARY') {
    button.fills = parseFills('#21262D');
  } else if (variant === 'OUTLINE') {
    button.fills = [];
  } else if (variant === 'GITHUB') {
    button.fills = parseFills('#238636');
  } else {
    button.fills = parseFills(op.backgroundColor || '#6366F1');
  }

  applyStrokesAndEffects(button, op);
  const targetParent = parent || figma.currentPage;
  targetParent.appendChild(button);

  if (op.icon) {
    await opCreateIcon({
      icon: op.icon,
      size: Number(op.iconSize || 16),
      color: op.iconColor || (variant === 'OUTLINE' ? '#6366F1' : '#FFFFFF')
    }, button);
  }

  const text = figma.createText();
  text.name = 'Label';
  text.fontName = await ensureFontLoaded(op.fontFamily || 'Inter', op.fontWeight === 'BOLD' ? 'Bold' : 'Medium');
  text.characters = String(op.label ?? op.text ?? op.title ?? 'Button');
  text.fontSize = Number(op.fontSize ?? 14);
  text.fills = parseFills(op.textColor || (variant === 'OUTLINE' ? '#6366F1' : '#FFFFFF'));
  button.appendChild(text);

  if (op.x != null && op.y != null) {
    button.x = Number(op.x);
    button.y = Number(op.y);
  }
  return button;
}

export async function opCreateBadge(op, parent) {
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
  text.fontName = await ensureFontLoaded(op.fontFamily || 'Inter', 'Medium');
  text.characters = String(op.text ?? op.label ?? 'Badge');
  text.fontSize = Number(op.fontSize ?? 11);
  text.fills = parseFills(op.textColor || '#A5B4FC');
  badge.appendChild(text);

  return badge;
}

export async function opCreateInput(op, parent) {
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
  text.fontName = await ensureFontLoaded(op.fontFamily || 'Inter', 'Regular');
  text.characters = String(op.placeholder ?? op.text ?? 'Introduce un valor...');
  text.fontSize = Number(op.fontSize ?? 13);
  text.fills = parseFills('#8B949E');
  input.appendChild(text);

  return input;
}

function createVariantState(name, color, label, font, op, radius, padX, padY) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.primaryAxisSizingMode = 'AUTO';
  comp.counterAxisSizingMode = 'AUTO';
  comp.paddingLeft = padX;
  comp.paddingRight = padX;
  comp.paddingTop = padY;
  comp.paddingBottom = padY;
  comp.cornerRadius = radius;
  comp.fills = parseFills(color);
  applyStrokesAndEffects(comp, op);

  const text = figma.createText();
  text.name = 'Label';
  text.fontName = font;
  text.characters = label;
  text.fontSize = Number(op.fontSize ?? 14);
  text.fills = parseFills(op.textColor || '#FFFFFF');
  comp.appendChild(text);
  return comp;
}

export async function opCreateInteractiveComponentSet(op, parent) {
  const padX = Number(op.paddingX ?? 18);
  const padY = Number(op.paddingY ?? 10);
  const radius = Number(op.cornerRadius ?? 8);
  const font = await ensureFontLoaded(op.fontFamily || 'Inter', 'Bold');
  const label = String(op.label ?? op.text ?? 'Botón Interactivo');

  const compDefault = createVariantState('State=Default', op.baseColor || op.backgroundColor || '#005F73', label, font, op, radius, padX, padY);
  const compHover = createVariantState('State=Hover', op.hoverColor || '#0A9396', label, font, op, radius, padX, padY);

  const isInsideFrame = Boolean(parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET' || parent.type === 'GROUP'));
  const setParent = isInsideFrame ? figma.currentPage : (parent || figma.currentPage);

  setParent.appendChild(compDefault);
  setParent.appendChild(compHover);

  const componentSet = figma.combineAsVariants([compDefault, compHover], setParent);
  componentSet.name = op.name || 'Interactive Button';

  try {
    compDefault.setReactions([{
      trigger: { type: 'WHILE_HOVERING' },
      actions: [{
        type: 'NODE',
        destinationId: compHover.id,
        navigation: 'CHANGE_TO',
        transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.2 }
      }]
    }]);
  } catch (err) {
    console.warn('[Figma AI Copilot] Error configurando reacción inteligente:', err);
  }

  if (isInsideFrame) {
    const instance = compDefault.createInstance();
    instance.name = op.name || 'Interactive Button';
    parent.appendChild(instance);
    return instance;
  }

  return componentSet;
}
