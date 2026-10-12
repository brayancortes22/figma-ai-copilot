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

  if (provider) provider.value = cfg.provider || 'auto';
  if (localUrl) localUrl.value = cfg.localUrl || 'http://localhost:3000';
  if (apiKey) apiKey.value = cfg.apiKey || '';

  if (preset) {
    const opt = preset.querySelector(`option[value="${cfg.model}"]`);
    if (opt) {
      preset.value = cfg.model;
      if (customModel) customModel.style.display = 'none';
    } else {
      preset.value = 'custom';
      if (customModel) {
        customModel.value = cfg.model || 'auto-smart';
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
  const apiKeyHint = document.getElementById('apiKeyHint');

  if (groupUrl) groupUrl.style.display = (prov === 'antigravity' || prov === 'smart-router') ? 'flex' : 'none';
  if (groupKey) groupKey.style.display = (prov === 'antigravity' || prov === 'smart-router' || prov === 'free-cloud') ? 'none' : 'flex';

  if (keyLabel && inputKey && apiKeyHint) {
    if (prov === 'auto') {
      keyLabel.textContent = 'API Key Opcional (Gemini, Cerebras o Groq)';
      inputKey.placeholder = 'AIzaSy... o csk-... o gsk-... (Opcional)';
      apiKeyHint.innerHTML = '💡 <strong>Modo Automático:</strong> Si no tienes clave o se agota tu cuota, el plugin usa la <strong>Nube Gratuita</strong> automáticamente sin interrumpir tu diseño.';
    } else if (prov === 'cerebras') {
      keyLabel.textContent = 'Cerebras Cloud API Key (1M tokens/día)';
      inputKey.placeholder = 'csk-...';
      apiKeyHint.innerHTML = '⚡ Clave gratis de 1M tokens/día en <a href="https://cloud.cerebras.ai" target="_blank" style="color: #818CF8; text-decoration: none;">cloud.cerebras.ai ↗</a>';
    } else if (prov === 'groq') {
      keyLabel.textContent = 'Groq Cloud API Key (Ultra Rápido)';
      inputKey.placeholder = 'gsk-...';
      apiKeyHint.innerHTML = '⚡ Clave gratis en <a href="https://console.groq.com/keys" target="_blank" style="color: #818CF8; text-decoration: none;">console.groq.com ↗</a>';
    } else if (prov === 'openrouter') {
      keyLabel.textContent = 'OpenRouter API Key (Modelos :free)';
      inputKey.placeholder = 'sk-or-v1-...';
      apiKeyHint.innerHTML = '🌐 Clave gratis en <a href="https://openrouter.ai/keys" target="_blank" style="color: #818CF8; text-decoration: none;">openrouter.ai ↗</a>';
    } else if (prov === 'gemini') {
      keyLabel.textContent = 'Google Gemini API Key';
      inputKey.placeholder = 'AIzaSy...';
      apiKeyHint.innerHTML = '✨ Clave gratis en <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #818CF8; text-decoration: none;">Google AI Studio ↗</a>';
    } else if (prov === 'openai') {
      keyLabel.textContent = 'OpenAI API Key';
      inputKey.placeholder = 'sk-proj-...';
      apiKeyHint.innerHTML = '🟢 Clave en <a href="https://platform.openai.com" target="_blank" style="color: #818CF8; text-decoration: none;">platform.openai.com ↗</a>';
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
    const provider = document.getElementById('providerSelect')?.value || 'auto';
    const localUrl = document.getElementById('inputLocalUrl')?.value.trim();
    const apiKey = document.getElementById('inputApiKey')?.value.trim();
    const preset = document.getElementById('selectModelPreset')?.value;
    const custom = document.getElementById('inputModelName')?.value.trim();
    const model = preset === 'custom' ? custom : preset;

    saveConfig({ provider, localUrl: localUrl || 'http://localhost:3000', apiKey, model: model || 'auto-smart' });
    document.getElementById('settingsDrawer')?.classList.remove('open');
    showToast('Ajustes guardados correctamente', 'success');
  });
}
