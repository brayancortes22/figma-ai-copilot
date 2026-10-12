/**
 * Figma AI Copilot - Controlador de Interfaz de Usuario (UI Controller)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import {
  setSelection, getSelection, formatNodeType,
  getActiveImage, setGenerating, getGenerating, requestFigmaStorage, applyStorageValue
} from './state.js';
import { callAIService } from './ai-service.js';
import { buildSystemPrompt, extractDSLFromResponse } from './dsl-parser.js';
import { showToast, setStatus } from './dom-utils.js';
import { appendUserMessage, appendAIMessage, showTypingIndicator, removeTypingIndicator } from './chat-view.js';
import { handleSelectionImageReceived, setImagePreview, clearPreview } from './image-handler.js';
import { syncSettingsUI, setupSettingsListeners } from './settings-view.js';

export function initUI() {
  syncSettingsUI();
  setupSettingsListeners();
  setupPromptListeners();
  requestFigmaStorage();
  postMessageToFigma({ type: 'GET_SELECTION' });
  window.addEventListener('message', handleWindowMessage);
}

export function postMessageToFigma(msg) {
  parent.postMessage({ pluginMessage: msg }, '*');
}

function handleWindowMessage(event) {
  const msg = event.data ? event.data.pluginMessage : null;
  if (!msg) return;

  switch (msg.type) {
    case 'DSL_RESULT':
      setStatus('online', 'Listo');
      if (msg.status === 'success') {
        showToast(msg.message || 'Operaciones ejecutadas con éxito', 'success');
      } else {
        showToast(msg.message || msg.error || 'Error en ejecución de DSL', 'error');
      }
      break;

    case 'STORAGE_GET_RESULT':
    case 'STORAGE_VALUE':
      if (applyStorageValue(msg.key, msg.value)) {
        syncSettingsUI();
        showToast('Ajustes sincronizados con Figma', 'info');
      }
      break;

    case 'SELECTION_CHANGE':
    case 'INIT_STATE':
      setSelection(msg.selection || []);
      updateSelectionBadge(msg.selection || []);
      break;

    case 'SELECTION_IMAGE_DATA':
      handleSelectionImageReceived(msg);
      break;

    case 'SELECTION_IMAGE_ERROR':
      showToast(msg.error || 'Error al exportar imagen', 'error');
      break;

    case 'EXECUTION_SUCCESS':
      setStatus('online', 'Listo');
      showToast(msg.message || 'Diseño actualizado en Figma', 'success');
      break;

    case 'EXECUTION_ERROR':
      setStatus('error', 'Error en lienzo');
      showToast(msg.error || 'Fallo al aplicar cambios', 'error');
      break;
  }
}

function updateSelectionBadge(nodes) {
  const badge = document.getElementById('selectionContext');
  if (!badge) return;
  if (!nodes || nodes.length === 0) {
    badge.innerHTML = '✨ Lienzo libre';
    badge.title = 'Nuevos elementos se crearán en la página activa';
    return;
  }
  const types = {};
  nodes.forEach(n => { types[n.type] = (types[n.type] || 0) + 1; });
  const summary = Object.entries(types).map(([t, q]) => `${q} ${formatNodeType(t, q)}`).join(', ');
  badge.innerHTML = `🎯 ${summary}`;
  badge.title = `Selección: ${nodes.map(n => n.name).join(', ')}`;
}

export async function handleSendPrompt(customText) {
  const input = document.getElementById('promptInput');
  const sendBtn = document.getElementById('btnSendPrompt');
  const text = (customText || input?.value || '').trim();
  const image = getActiveImage();

  if (!text || getGenerating()) return;

  setGenerating(true);
  if (sendBtn) sendBtn.disabled = true;
  setStatus('busy', image ? 'Analizando imagen...' : 'Pensando...');
  appendUserMessage(text + (image ? ' 📸 (con referencia)' : ''));
  if (input) input.value = '';
  clearPreview();
  showTypingIndicator();

  try {
    const sysPrompt = buildSystemPrompt(getSelection(), Boolean(image));
    const rawResponse = await callAIService(sysPrompt, text, image, (notice) => {
      setStatus('busy', 'Conmutando IA...');
    });
    removeTypingIndicator();

    const dslOperations = extractDSLFromResponse(rawResponse);
    appendAIMessage(rawResponse, dslOperations, executeDSL);

    if (dslOperations && dslOperations.length > 0) {
      executeDSL(dslOperations);
    } else {
      setStatus('online', 'Listo');
    }
  } catch (err) {
    removeTypingIndicator();
    setStatus('error', 'Fallo');
    showToast(err.message, 'error');
  } finally {
    setGenerating(false);
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

export function executeDSL(operations) {
  if (!operations || operations.length === 0) return;
  setStatus('busy', 'Aplicando en Figma...');
  postMessageToFigma({ type: 'EXECUTE_DSL', operations, payload: operations });
}

function setupPromptListeners() {
  document.getElementById('btnRefreshSelection')?.addEventListener('click', () => {
    postMessageToFigma({ type: 'GET_SELECTION' });
    showToast('Sincronizando selección...', 'info');
  });

  document.getElementById('btnCaptureFigmaImage')?.addEventListener('click', () => {
    showToast('Capturando imagen de capa...', 'info');
    postMessageToFigma({ type: 'EXPORT_SELECTION_IMAGE' });
  });

  document.getElementById('inputUploadImage')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImagePreview(evt.target.result, `📁 ${file.name}`);
      showToast('Imagen cargada. Pulsa Enviar para recrearla.', 'success');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btnRemoveImage')?.addEventListener('click', clearPreview);

  const input = document.getElementById('promptInput');
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  });

  document.getElementById('btnSendPrompt')?.addEventListener('click', () => handleSendPrompt());

  document.querySelectorAll('.quick-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-prompt');
      if (p) handleSendPrompt(p);
    });
  });
}
