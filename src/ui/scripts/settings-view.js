/**
 * Figma AI Copilot - Panel y Configuración de Proveedores (Settings View)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { getConfig, saveConfig } from './state.js';
import { showToast } from './dom-utils.js';

export function syncSettingsUI() {
  const cfg = getConfig();
  const provider = document.getElementById('providerSelect');
  const localUrl = document.getElementById('inputLocalUrl');
  const apiKey = document.getElementById('inputApiKey');
  const preset = document.getElementById('selectModelPreset');
  const customModel = document.getElementById('inputModelName');

  if (provider) provider.value = cfg.provider;
  if (localUrl) localUrl.value = cfg.localUrl;
  if (apiKey) apiKey.value = cfg.apiKey;

  if (preset) {
    const opt = preset.querySelector(`option[value="${cfg.model}"]`);
    if (opt) {
      preset.value = cfg.model;
      if (customModel) customModel.style.display = 'none';
    } else {
      preset.value = 'custom';
      if (customModel) {
        customModel.value = cfg.model || 'gemini-3.8-flash';
        customModel.style.display = 'block';
      }
    }
  }
  updateProviderFormVisibility();
}

export function updateProviderFormVisibility() {
  const prov = document.getElementById('providerSelect')?.value;
  const groupUrl = document.getElementById('groupLocalUrl');
  const groupKey = document.getElementById('groupApiKey');
  const keyLabel = document.getElementById('apiKeyLabel');
  const inputKey = document.getElementById('inputApiKey');

  if (groupUrl) groupUrl.style.display = (prov === 'antigravity' || prov === 'smart-router') ? 'flex' : 'none';
  if (groupKey) groupKey.style.display = (prov === 'antigravity' || prov === 'smart-router') ? 'none' : 'flex';

  if (keyLabel && inputKey) {
    if (prov === 'gemini') {
      keyLabel.textContent = 'Google Gemini API Key';
      inputKey.placeholder = 'AIzaSy... (Google AI Studio)';
    } else if (prov === 'openai') {
      keyLabel.textContent = 'OpenAI API Key';
      inputKey.placeholder = 'sk-proj-...';
    } else if (prov === 'groq') {
      keyLabel.textContent = 'Groq Cloud API Key';
      inputKey.placeholder = 'gsk_...';
    } else if (prov === 'openrouter') {
      keyLabel.textContent = 'OpenRouter API Key';
      inputKey.placeholder = 'sk-or-v1-...';
    }
  }
}

export function setupSettingsListeners() {
  document.getElementById('btnToggleSettings')?.addEventListener('click', () => {
    document.getElementById('settingsDrawer')?.classList.toggle('open');
  });

  document.getElementById('providerSelect')?.addEventListener('change', updateProviderFormVisibility);

  document.getElementById('btnToggleApiKey')?.addEventListener('click', () => {
    const input = document.getElementById('inputApiKey');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('selectModelPreset')?.addEventListener('change', (e) => {
    const custom = document.getElementById('inputModelName');
    if (!custom) return;
    if (e.target.value === 'custom') {
      custom.style.display = 'block';
      custom.focus();
    } else {
      custom.style.display = 'none';
      custom.value = e.target.value;
    }
  });

  document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
    const provider = document.getElementById('providerSelect')?.value;
    const localUrl = document.getElementById('inputLocalUrl')?.value.trim();
    const apiKey = document.getElementById('inputApiKey')?.value.trim();
    const preset = document.getElementById('selectModelPreset')?.value;
    const custom = document.getElementById('inputModelName')?.value.trim();
    const model = preset === 'custom' ? custom : preset;

    saveConfig({ provider, localUrl: localUrl || 'http://localhost:3000', apiKey, model: model || 'gemini-3.8-flash' });
    document.getElementById('settingsDrawer')?.classList.remove('open');
    showToast('Ajustes guardados correctamente', 'success');
  });
}
