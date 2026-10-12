/**
 * Figma AI Copilot - Conexión Multimodal y Gateway de Proveedores de IA con Cascada Automática
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { getConfig } from './state.js';
import { callGeminiCascade } from './gemini-provider.js';
import { callFreeCloudDirect } from './free-cloud.js';
import { showToast } from './dom-utils.js';

export async function callAIService(systemPrompt, userPrompt, imageBase64 = null, onStatusNotice = null) {
  const config = getConfig();
  const provider = config.provider || 'auto';

  // 1. MODO AUTO INTELIGENTE (Nunca se bloquea por cuota o tráfico)
  if (provider === 'auto') {
    if (config.apiKey && config.apiKey.trim().length > 5) {
      try {
        const result = await callGeminiCascade(
          config.apiKey.trim(),
          config.model,
          systemPrompt,
          userPrompt,
          imageBase64,
          (nextModel) => {
            const msg = `🔄 Tráfico en Gemini. Conmutando a ${nextModel}...`;
            if (onStatusNotice) onStatusNotice(msg);
            showToast(msg, 'info');
          }
        );
        return result.text;
      } catch (geminiErr) {
        console.warn('[Figma AI Copilot] Gemini sin cuota o alta demanda. Conmutando a Nube Gratuita:', geminiErr);
        const notice = '🔄 Cuota de Gemini agotada. Usando Nube Gratuita de respaldo sin bloqueo...';
        if (onStatusNotice) onStatusNotice(notice);
        showToast(notice, 'info');
      }
    } else {
      const notice = '🌐 Usando Nube Gratuita Pública (Sin API Key)';
      if (onStatusNotice) onStatusNotice(notice);
      showToast(notice, 'info');
    }

    // Salto transparente a la Nube Gratuita Pública
    return await callFreeCloudDirect(systemPrompt, userPrompt, imageBase64);
  }

  // 2. MODO NUBE GRATUITA PÚBLICA DIRECTO
  if (provider === 'free-cloud') {
    return await callFreeCloudDirect(systemPrompt, userPrompt, imageBase64);
  }

  // 3. MODO GEMINI DIRECTO
  if (provider === 'gemini') {
    if (!config.apiKey || config.apiKey.trim().length < 5) {
      throw new Error('Por favor pega tu API Key en el engranaje ⚙️ o cambia a "Modo Inteligente Automático"');
    }
    const result = await callGeminiCascade(
      config.apiKey,
      config.model,
      systemPrompt,
      userPrompt,
      imageBase64,
      (nextModel) => showToast(`🔄 Probando modelo de respaldo ${nextModel}...`, 'info')
    );
    return result.text;
  }

  // 4. OTROS PROVEEDORES
  if (provider === 'groq') return await callGroqDirect(systemPrompt, userPrompt);
  if (provider === 'openai') return await callOpenAIDirect(systemPrompt, userPrompt, imageBase64);
  if (provider === 'openrouter') return await callOpenRouterDirect(systemPrompt, userPrompt);
  if (provider === 'antigravity' || provider === 'smart-router') return await callSmartRouter(systemPrompt, userPrompt);

  throw new Error(`Proveedor de IA no reconocido: ${provider}`);
}

async function callSmartRouter(systemPrompt, userPrompt) {
  const config = getConfig();
  const baseUrl = config.localUrl ? config.localUrl.replace(/\/+$/, '') : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'qwen-3.8-27b',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) throw new Error(`Smart Router error (${res.status})`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenAIDirect(systemPrompt, userPrompt, imageBase64) {
  const config = getConfig();
  if (!config.apiKey) throw new Error('Se requiere un API Key de OpenAI');
  const userContent = imageBase64
    ? [{ type: 'text', text: userPrompt }, { type: 'image_url', image_url: { url: imageBase64 } }]
    : userPrompt;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model || 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGroqDirect(systemPrompt, userPrompt) {
  const config = getConfig();
  if (!config.apiKey) throw new Error('Se requiere un API Key de Groq');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model || 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq error (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenRouterDirect(systemPrompt, userPrompt) {
  const config = getConfig();
  if (!config.apiKey) throw new Error('Se requiere un API Key de OpenRouter');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://figma.com',
      'X-Title': 'Figma AI Copilot'
    },
    body: JSON.stringify({
      model: config.model || 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter error (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
