/**
 * Figma AI Copilot - Operaciones de Selección, Alineación y Edición
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { parseFills, ensureFontLoaded } from '../helpers.js';

export async function opAlignSelection(op) {
  const nodes = op.nodeIds
    ? op.nodeIds.map(id => figma.getNodeById(id)).filter(Boolean)
    : [...figma.currentPage.selection];

  if (nodes.length < 2) {
    throw new Error('Se requieren al menos 2 elementos seleccionados para alinear.');
  }

  const direction = String(op.direction || 'ROW').toUpperCase();
  const spacing = Number(op.spacing ?? 16);

  if (direction === 'ROW' || direction === 'HORIZONTAL') {
    nodes.sort((a, b) => a.x - b.x);
    let curX = nodes[0].x;
    const baseVal = nodes[0].y;
    for (const node of nodes) {
      node.x = curX;
      if (op.alignCross === 'CENTER') {
        node.y = baseVal + (nodes[0].height - node.height) / 2;
      }
      curX += node.width + spacing;
    }
  } else if (direction === 'COLUMN' || direction === 'VERTICAL') {
    nodes.sort((a, b) => a.y - b.y);
    let curY = nodes[0].y;
    const baseVal = nodes[0].x;
    for (const node of nodes) {
      node.y = curY;
      if (op.alignCross === 'CENTER') {
        node.x = baseVal + (nodes[0].width - node.width) / 2;
      }
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

export async function opRenameNodes(op) {
  const nodes = op.nodeIds
    ? op.nodeIds.map(id => figma.getNodeById(id)).filter(Boolean)
    : [...figma.currentPage.selection];

  if (nodes.length === 0) {
    throw new Error('No hay capas seleccionadas para renombrar.');
  }

  const pattern = String(op.newName || op.name || 'Layer');
  nodes.forEach((node, idx) => {
    node.name = pattern
      .replace('{i}', String(idx + 1))
      .replace('{n}', String(node.name));
  });

  return nodes[0];
}

export async function opEditNode(op) {
  const target = op.nodeId ? figma.getNodeById(op.nodeId) : figma.currentPage.selection[0];
  if (!target) {
    throw new Error(`Nodo no encontrado para EDIT_NODE: ${op.nodeId || 'selección vacía'}`);
  }

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
