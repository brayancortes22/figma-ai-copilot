/**
 * Figma AI Copilot - Operaciones de Layout (Frames y Auto-Layout)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { parseFills, applyStrokesAndEffects } from '../helpers.js';
import { resolveDevicePreset } from '../presets.js';
import { applyScrollBehavior } from './prototype.js';

let childExecutor = null;

export function registerChildExecutor(executor) {
  childExecutor = executor;
}

export async function opCreateFrame(op, parent) {
  const frame = figma.createFrame();
  const preset = resolveDevicePreset(op);
  const width = Math.max(1, op.width || preset?.width || 320);
  const height = Math.max(1, op.height || preset?.height || 200);

  frame.name = op.name || preset?.name || 'Frame';
  frame.resize(width, height);

  if (op.cornerRadius != null) frame.cornerRadius = Number(op.cornerRadius);
  if (op.fills !== undefined) frame.fills = parseFills(op.fills);

  applyStrokesAndEffects(frame, op);
  applyScrollBehavior(frame, op);

  const mode = String(op.layoutMode || '').toUpperCase();
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

    if (op.layoutWrap === 'WRAP' || op.wrap) {
      try { frame.layoutWrap = 'WRAP'; } catch {}
    }
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

  if (Array.isArray(op.children) && op.children.length > 0 && childExecutor) {
    for (const childOp of op.children) {
      await childExecutor(childOp, frame);
    }
  }

  return frame;
}

export async function opApplyAutoLayout(op) {
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

  const dir = String(op.direction || op.layoutMode || 'VERTICAL').toUpperCase();
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

  if (op.layoutWrap === 'WRAP' || op.wrap) {
    try { frame.layoutWrap = 'WRAP'; } catch {}
  }

  return frame;
}
