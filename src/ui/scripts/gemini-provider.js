/**
 * Figma AI Copilot - Proveedor Google Gemini con Cascada Automática de Tráfico (2026)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export const GEMINI_2026_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];

export async function callGeminiCascade(apiKey, selectedModel, systemPrompt, userPrompt, imageBase64 = null, onModelSwitch = null) {
  if (!apiKey || apiKey.trim().length < 5) {
    throw new Error('API_KEY_REQUIRED');
  }

  const preferred = (selectedModel && selectedModel !== 'auto-smart') ? selectedModel : 'gemini-3.8-flash';
  const candidates = [preferred, ...GEMINI_2026_MODELS].filter(Boolean);
  const modelsToTry = [...new Set(candidates)];

  const parts = [{ text: `${systemPrompt}\n\nInstrucción del usuario:\n${userPrompt || 'Recrea este diseño en Figma con componentes y Auto-Layout'}` }];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inlineData: { mimeType: 'image/png', data: cleanBase64 }
    });
  }

  let lastError = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
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
        if (text) return { text, modelUsed: model };
      } else {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error?.message || `HTTP ${res.status}`;
        lastError = new Error(errMsg);

        // Si es cuota excedida (429), no encontrado (404), saturado (503) o RESOURCE_EXHAUSTED
        if ([404, 429, 503].includes(res.status) || err.error?.status === 'RESOURCE_EXHAUSTED' || errMsg.includes('Quota exceeded')) {
          if (i < modelsToTry.length - 1 && onModelSwitch) {
            onModelSwitch(modelsToTry[i + 1]);
          }
          continue;
        }
        throw lastError;
      }
    } catch (err) {
      lastError = err;
      if (err.message?.includes('exceeded') || err.message?.includes('quota') || err.message?.includes('demand') || err.message?.includes('404')) {
        if (i < modelsToTry.length - 1 && onModelSwitch) {
          onModelSwitch(modelsToTry[i + 1]);
        }
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('QUOTA_EXHAUSTED_ALL_MODELS');
}
