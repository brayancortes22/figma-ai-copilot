/**
 * Figma AI Copilot - Conector Unificado para Proveedores OpenAI-Compatibles
 * Soporta: Cerebras Cloud, Groq Cloud, OpenRouter, OpenAI y Smart Router
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export const PROVIDER_ENDPOINTS = {
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b',
    name: 'Cerebras Cloud (1M tokens/día gratis)'
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    name: 'Groq Cloud (Ultra Rápido)'
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'OpenRouter Free Tier'
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    name: 'OpenAI'
  }
};

export async function callOpenAICompatible(endpointUrl, apiKey, model, systemPrompt, userPrompt, extraHeaders = {}) {
  if (!apiKey || apiKey.trim().length < 3) {
    throw new Error('API_KEY_REQUIRED');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey.trim()}`,
    ...extraHeaders
  };

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'llama-3.3-70b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.15
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errMsg = err.error?.message || err.message || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Respuesta vacía del proveedor');
  return content;
}
