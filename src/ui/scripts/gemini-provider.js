/**
 * Figma AI Copilot - Proveedor Google Gemini con Cascada Automática Robusta (2026)
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

  const parts = [{ text: `${systemPrompt}\n\nInstrucción del usuario:\n${userPrompt || 'Diseña en Figma con componentes reales y Auto-Layout'}` }];
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
        if (text && text.trim().length > 10) {
          return { text, modelUsed: model };
        }
      } else {
        const err = await res.json().catch(() => ({}));
        const errMsg = err.error?.message || `HTTP ${res.status}`;
        lastError = new Error(errMsg);
        console.warn(`[Figma AI Copilot] Modelo ${model} no disponible (${res.status}): ${errMsg}`);

        // Si este modelo falló (por cuota 429, no disponible 404, saturado 503, etc.)
        // y hay más modelos en la lista, probamos el siguiente de inmediato
        if (i < modelsToTry.length - 1) {
          if (onModelSwitch) onModelSwitch(modelsToTry[i + 1]);
          continue;
        }
      }
    } catch (networkErr) {
      lastError = networkErr;
      console.warn(`[Figma AI Copilot] Excepción de red en ${model}:`, networkErr.message);
      if (i < modelsToTry.length - 1) {
        if (onModelSwitch) onModelSwitch(modelsToTry[i + 1]);
        continue;
      }
    }
  }

  throw lastError || new Error('QUOTA_EXHAUSTED_ALL_MODELS');
}
