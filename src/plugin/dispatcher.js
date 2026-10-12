/**
 * Figma AI Copilot - Dispatcher de Operaciones DSL
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

export async function executeSingleOperation(rawOp, parent = null) {
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

// Vincular ejecución recursiva de hijos
registerChildExecutor(executeSingleOperation);

export async function executeDsl(payload) {
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

  if (affectedNodes.length > 0) {
    figma.currentPage.selection = affectedNodes;
    figma.viewport.scrollAndZoomIntoView(affectedNodes);
  }

  return affectedNodes;
}
