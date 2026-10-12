/**
 * Figma AI Copilot - Gestión de Estado, Configuración y Storage Sync
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export const STORAGE_KEY = 'figma_ai_copilot_config_v1';

export const defaultConfig = {
  provider: 'auto', // 'auto' | 'free-cloud' | 'gemini' | 'groq' | 'openrouter' | 'openai' | 'antigravity'
  localUrl: 'http://localhost:3000',
  apiKey: '',
  model: 'auto-smart'
};

let appConfig = loadInitialConfig();
let currentSelection = [];
let activeImageBase64 = null;
let isGenerating = false;

function loadInitialConfig() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('[Figma AI Copilot] Fallback in-memory por DOMException en localStorage:', e);
  }
  return { ...defaultConfig };
}

export function getConfig() {
  return appConfig;
}

export function requestFigmaStorage() {
  try {
    parent.postMessage({ pluginMessage: { type: 'STORAGE_GET', key: STORAGE_KEY } }, '*');
  } catch (e) {
    console.warn('[Figma AI Copilot] Error solicitando STORAGE_GET a Figma:', e);
  }
}

export function applyStorageValue(key, value) {
  if (key === STORAGE_KEY && value) {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      appConfig = { ...defaultConfig, ...parsed };
      return true;
    } catch (e) {
      console.warn('[Figma AI Copilot] Error parseando storage value:', e);
    }
  }
  return false;
}

export function saveConfig(newConfig) {
  appConfig = { ...appConfig, ...newConfig };
  try {
    parent.postMessage({ pluginMessage: { type: 'STORAGE_SET', key: STORAGE_KEY, value: appConfig } }, '*');
  } catch (e) {
    console.warn('[Figma AI Copilot] Error guardando en STORAGE_SET de Figma:', e);
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appConfig));
    }
  } catch (e) {
    console.warn('[Figma AI Copilot] DOMException al persistir en localStorage:', e);
  }
  return appConfig;
}

export function setSelection(nodes) {
  currentSelection = nodes || [];
}

export function getSelection() {
  return currentSelection;
}

export function formatNodeType(type, qty) {
  const map = {
    'FRAME': qty > 1 ? 'Frames' : 'Frame',
    'TEXT': qty > 1 ? 'Textos' : 'Texto',
    'RECTANGLE': qty > 1 ? 'Rectángulos' : 'Rectángulo',
    'COMPONENT': qty > 1 ? 'Componentes' : 'Componente',
    'INSTANCE': qty > 1 ? 'Instancias' : 'Instancia',
    'GROUP': qty > 1 ? 'Grupos' : 'Grupo',
    'VECTOR': qty > 1 ? 'Vectores' : 'Vector'
  };
  return map[type] || type;
}

export function setActiveImage(base64) {
  activeImageBase64 = base64;
}

export function getActiveImage() {
  return activeImageBase64;
}

export function clearActiveImage() {
  activeImageBase64 = null;
}

export function setGenerating(val) {
  isGenerating = Boolean(val);
}

export function getGenerating() {
  return isGenerating;
}
