/**
 * Figma AI Copilot - Conexión Multimodal y Gateway de Proveedores de IA
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { getConfig } from './state.js';

export async function callAIService(systemPrompt, userPrompt, imageBase64 = null) {
  const config = getConfig();
  switch (config.provider) {
    case 'gemini':
      return await callGeminiDirect(systemPrompt, userPrompt, imageBase64);
    case 'antigravity':
    case 'smart-router':
      return await callSmartRouter(systemPrompt, userPrompt);
    case 'openai':
      return await callOpenAIDirect(systemPrompt, userPrompt, imageBase64);
    case 'groq':
      return await callGroqDirect(systemPrompt, userPrompt);
    case 'openrouter':
      return await callOpenRouterDirect(systemPrompt, userPrompt);
    default:
      throw new Error(`Proveedor de IA no reconocido: ${config.provider}`);
  }
}

async function callGeminiDirect(systemPrompt, userPrompt, imageBase64) {
  const config = getConfig();
  if (!config.apiKey) {
    throw new Error('Abre el engranaje ⚙️ y pega tu Gemini API Key de Google AI Studio');
  }

  const candidates = [
    config.model,
    'gemini-3.8-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ].filter(Boolean);
  const modelsToTry = [...new Set(candidates)];

  const parts = [{ text: `${systemPrompt}\n\nInstrucción del usuario:\n${userPrompt || 'Recrea este diseño en Figma'}` }];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inlineData: { mimeType: 'image/png', data: cleanBase64 }
    });
  }

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 8192 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const err = await res.json().catch(() => ({}));
        lastError = new Error(err.error?.message || `Error Gemini (${res.status})`);
        if ([404, 429, 503].includes(res.status) || err.error?.status === 'RESOURCE_EXHAUSTED') continue;
        throw lastError;
      }
    } catch (err) {
      lastError = err;
      if (err.message?.includes('exceeded') || err.message?.includes('quota') || err.message?.includes('404')) continue;
      throw err;
    }
  }
  throw lastError || new Error('No se pudo conectar con ningún modelo de Gemini disponible');
}

async function callSmartRouter(systemPrompt, userPrompt) {
  const config = getConfig();
  const baseUrl = config.localUrl ? config.localUrl.replace(/\/+$/, '') : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'qwen-3.8-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
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
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
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
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
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
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter error (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
