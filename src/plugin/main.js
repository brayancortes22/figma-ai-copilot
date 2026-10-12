/**
 * Figma AI Copilot - Entrada Principal del Plugin Sandbox
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { serializeNode } from './helpers.js';
import { executeDsl } from './dispatcher.js';

// Inicializar UI en el Sandbox
figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true
});

function broadcastSelection() {
  const selection = figma.currentPage.selection.map(serializeNode).filter(Boolean);
  figma.ui.postMessage({
    type: 'SELECTION_CHANGE',
    selection,
    count: selection.length
  });
}

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
        const serialized = resultNodes.map(serializeNode).filter(Boolean);

        figma.ui.postMessage({
          type: 'DSL_RESULT',
          status: 'success',
          message: `Ejecución DSL exitosa (${resultNodes.length} nodos procesados)`,
          nodes: serialized,
          count: resultNodes.length
        });
        figma.ui.postMessage({
          type: 'EXECUTION_SUCCESS',
          count: resultNodes.length,
          message: `Ejecución DSL exitosa (${resultNodes.length} nodos procesados)`
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
          figma.notify('⚠️ Por favor selecciona una capa primero', { error: true });
          break;
        }

        const targetNode = selection[0];
        try {
          const maxDim = Math.max(targetNode.width, targetNode.height);
          const scaleVal = Math.min(2, Math.max(0.5, 800 / (maxDim || 1)));
          const bytes = await targetNode.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: scaleVal }
          });

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

      case 'STORAGE_GET': {
        const value = await figma.clientStorage.getAsync(msg.key);
        figma.ui.postMessage({
          type: 'STORAGE_GET_RESULT',
          key: msg.key,
          value
        });
        break;
      }

      case 'STORAGE_SET': {
        await figma.clientStorage.setAsync(msg.key, msg.value);
        figma.ui.postMessage({
          type: 'STORAGE_SET_RESULT',
          key: msg.key,
          success: true
        });
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
      message: errMessage,
      error: errMessage
    });
    figma.ui.postMessage({
      type: 'EXECUTION_ERROR',
      error: errMessage
    });
    figma.notify(`❌ Error: ${errMessage}`, { error: true });
  }
};

// Notificar estado inicial al arrancar el plugin
broadcastSelection();
figma.ui.postMessage({
  type: 'INIT_STATE',
  selection: figma.currentPage.selection.map(serializeNode).filter(Boolean)
});
