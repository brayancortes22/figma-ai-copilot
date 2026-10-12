/**
 * Figma AI Copilot - Conexión a Nube Gratuita Pública (Sin API Key)
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export async function callFreeCloudDirect(systemPrompt, userPrompt, imageBase64 = null) {
  const userText = imageBase64
    ? `${userPrompt || 'Recrea este diseño en Figma con componentes reales'} (Diseño con referencia visual adjunta)`
    : (userPrompt || 'Diseña en Figma');

  // Intento 1: Pollinations AI Text API (Modelo OpenAI / Llama 3.3 optimizado)
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 100000)
      })
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) return text;
    }
  } catch (err) {
    console.warn('[Figma AI Copilot] Error en endpoint 1 de nube gratuita:', err);
  }

  // Intento 2: Pollinations AI con modelo Qwen / Mistral
  try {
    const res2 = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
        model: 'mistral',
        seed: Math.floor(Math.random() * 100000)
      })
    });

    if (res2.ok) {
      const text2 = await res2.text();
      if (text2 && text2.trim().length > 10) return text2;
    }
  } catch (err2) {
    console.warn('[Figma AI Copilot] Error en endpoint 2 de nube gratuita:', err2);
  }

  throw new Error('La nube gratuita pública está experimentando alta demanda. Por favor reintenta en unos instantes.');
}
