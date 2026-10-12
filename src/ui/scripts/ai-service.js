/**
 * Figma AI Copilot - Conexión Multimodal y Gateway de Proveedores de IA con Cascada Automática
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { getConfig } from './state.js';
import { callGeminiCascade } from './gemini-provider.js';
import { callFreeCloudDirect } from './free-cloud.js';
import { callOpenAICompatible, PROVIDER_ENDPOINTS } from './openai-compatible-provider.js';
import { showToast } from './dom-utils.js';

export async function callAIService(systemPrompt, userPrompt, imageBase64 = null, onStatusNotice = null) {
  const config = getConfig();
  const provider = config.provider || 'auto';

  // 1. MODO AUTO INTELIGENTE O GEMINI (Conmutación resiliente)
  if (provider === 'auto' || provider === 'gemini') {
    if (config.apiKey && config.apiKey.trim().length > 5) {
      try {
        const result = await callGeminiCascade(
          config.apiKey.trim(),
          config.model,
          systemPrompt,
          userPrompt,
          imageBase64,
          (nextModel) => {
            const msg = `🔄 Conmutando a ${nextModel}...`;
            if (onStatusNotice) onStatusNotice(msg);
            showToast(msg, 'info');
          }
        );
        return result.text;
      } catch (geminiErr) {
        console.warn('[Figma AI Copilot] Gemini sin cuota diaria. Conmutando a Nube Gratuita:', geminiErr);
        const notice = '🔄 Cuota de Gemini agotada. Usando Nube Gratuita sin bloqueo...';
        if (onStatusNotice) onStatusNotice(notice);
        showToast(notice, 'info');
      }
    } else {
      const notice = '🌐 Diseñando con Nube Gratuita Pública (Sin API Key)';
      if (onStatusNotice) onStatusNotice(notice);
      showToast(notice, 'info');
    }

    return await callFreeCloudDirect(systemPrompt, userPrompt, imageBase64);
  }

  // 2. MODO NUBE GRATUITA DIRECTO
  if (provider === 'free-cloud') {
    return await callFreeCloudDirect(systemPrompt, userPrompt, imageBase64);
  }

  // 3. MODO CEREBRAS CLOUD (1M Tokens/día Gratis - 2600 t/s)
  if (provider === 'cerebras') {
    if (!config.apiKey) throw new Error('Pega tu API Key gratuita de Cerebras en el engranaje ⚙️ (cloud.cerebras.ai)');
    const endpoint = PROVIDER_ENDPOINTS.cerebras;
    return await callOpenAICompatible(endpoint.url, config.apiKey, config.model || endpoint.defaultModel, systemPrompt, userPrompt);
  }

  // 4. MODO GROQ CLOUD (Ultra Rápido Gratis)
  if (provider === 'groq') {
    if (!config.apiKey) throw new Error('Pega tu API Key gratuita de Groq en el engranaje ⚙️ (console.groq.com)');
    const endpoint = PROVIDER_ENDPOINTS.groq;
    return await callOpenAICompatible(endpoint.url, config.apiKey, config.model || endpoint.defaultModel, systemPrompt, userPrompt);
  }

  // 5. MODO OPENROUTER (Modelos Gratuitos :free)
  if (provider === 'openrouter') {
    if (!config.apiKey) throw new Error('Pega tu API Key de OpenRouter en el engranaje ⚙️ (openrouter.ai)');
    const endpoint = PROVIDER_ENDPOINTS.openrouter;
    return await callOpenAICompatible(
      endpoint.url, config.apiKey, config.model || endpoint.defaultModel, systemPrompt, userPrompt,
      { 'HTTP-Referer': 'https://figma.com', 'X-Title': 'Figma AI Copilot' }
    );
  }

  // 6. MODO OPENAI DIRECTO
  if (provider === 'openai') {
    if (!config.apiKey) throw new Error('Se requiere un API Key de OpenAI');
    const endpoint = PROVIDER_ENDPOINTS.openai;
    return await callOpenAICompatible(endpoint.url, config.apiKey, config.model || endpoint.defaultModel, systemPrompt, userPrompt);
  }

  // 7. MODO SMART ROUTER LOCAL
  if (provider === 'antigravity' || provider === 'smart-router') {
    const baseUrl = config.localUrl ? config.localUrl.replace(/\/+$/, '') : 'http://localhost:3000';
    return await callOpenAICompatible(`${baseUrl}/v1/chat/completions`, 'local-dummy-key', config.model || 'qwen-3.8-27b', systemPrompt, userPrompt);
  }

  throw new Error(`Proveedor de IA no reconocido: ${provider}`);
}
