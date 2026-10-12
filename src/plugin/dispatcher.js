/**
 * Figma AI Copilot - Dispatcher de Operaciones DSL y Prototipado
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { normalizeOperation } from './helpers.js';
import { opCreateFrame, opApplyAutoLayout, registerChildExecutor } from './operations/layout.js';
import {
  opCreateButton,
  opCreateBadge,
  opCreateInput,
  opCreateInteractiveComponentSet
} from './operations/components.js';
import {
  opCreateRectangle,
  opCreateEllipse,
  opCreateText,
  opCreateIcon
} from './operations/primitives.js';
import { opAlignSelection, opRenameNodes, opEditNode } from './operations/selection.js';
import { applyNodeInteraction } from './operations/prototype.js';

const activeNodeLookup = new Map();
let pendingInteractions = [];

export async function executeSingleOperation(rawOp, parent = null) {
  const op = normalizeOperation(rawOp);
  const action = op.action;
  let node = null;

  switch (action) {
    case 'CREATE_FRAME':
      node = await opCreateFrame(op, parent);
      break;
    case 'CREATE_BUTTON':
      node = await opCreateButton(op, parent);
      break;
    case 'CREATE_ICON':
      node = await opCreateIcon(op, parent);
      break;
    case 'CREATE_COMPONENT_SET':
    case 'CREATE_INTERACTIVE_BUTTON':
      node = await opCreateInteractiveComponentSet(op, parent);
      break;
    case 'CREATE_BADGE':
      node = await opCreateBadge(op, parent);
      break;
    case 'CREATE_INPUT':
      node = await opCreateInput(op, parent);
      break;
    case 'CREATE_TEXT':
      node = await opCreateText(op, parent);
      break;
    case 'CREATE_RECTANGLE':
      node = await opCreateRectangle(op, parent);
      break;
    case 'CREATE_ELLIPSE':
      node = await opCreateEllipse(op, parent);
      break;
    case 'EDIT_NODE':
    case 'MODIFY_NODE':
      node = await opEditNode(op);
      break;
    case 'APPLY_AUTOLAYOUT':
    case 'SET_AUTO_LAYOUT':
      node = await opApplyAutoLayout(op);
      break;
    case 'ALIGN_SELECTION':
      node = await opAlignSelection(op);
      break;
    case 'RENAME_NODES':
      node = await opRenameNodes(op);
      break;
    case 'CREATE_INTERACTION':
      pendingInteractions.push({ source: op.source || op.from, interaction: op });
      return null;
    default:
      node = await opCreateFrame(op, parent);
      break;
  }

  if (node && 'id' in node) {
    if (op.name) activeNodeLookup.set(op.name, node);
    if (op.id) activeNodeLookup.set(op.id, node);
    activeNodeLookup.set(node.id, node);

    if (op.interaction) {
      pendingInteractions.push({ source: node, interaction: op.interaction });
    }
  }

  return node;
}

// Vincular ejecución recursiva de hijos
registerChildExecutor(executeSingleOperation);

export async function executeDsl(payload) {
  const operations = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.operations)
    ? payload.operations
    : [payload];

  activeNodeLookup.clear();
  pendingInteractions = [];
  const affectedNodes = [];

  for (const op of operations) {
    if (!op || typeof op !== 'object') continue;
    const node = await executeSingleOperation(op);
    if (node && 'id' in node) {
      affectedNodes.push(node);
    }
  }

  // Resolver interacciones de prototipado diferidas entre pantallas
  for (const item of pendingInteractions) {
    let src = item.source;
    if (typeof src === 'string') {
      src = activeNodeLookup.get(src) || figma.currentPage.findOne(n => n.name === src || n.id === src);
    }
    if (src) {
      applyNodeInteraction(src, item.interaction, activeNodeLookup);
    }
  }

  if (affectedNodes.length > 0) {
    figma.currentPage.selection = affectedNodes;
    figma.viewport.scrollAndZoomIntoView(affectedNodes);
  }

  return affectedNodes;
}
