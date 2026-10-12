/**
 * Figma AI Copilot - Conexión a Nube Gratuita Pública con Respaldo Auto-Generativo
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { generateOfflineSmartDesign } from './smart-fallback.js';

export async function callFreeCloudDirect(systemPrompt, userPrompt, imageBase64 = null) {
  const userText = imageBase64
    ? `${userPrompt || 'Diseña en Figma'} (con imagen de referencia visual adjunta)`
    : (userPrompt || 'Diseña en Figma');

  const strictSystem = `${systemPrompt}\n\nIMPORTANTE: Tu respuesta DEBE incluir obligatoriamente un bloque de código: \`\`\`json\n{\n  "operations": [\n    ...\n  ]\n}\n\`\`\` con acciones como CREATE_FRAME, CREATE_BUTTON, CREATE_INPUT, CREATE_TEXT, CREATE_ICON, etc.`;

  // Intento 1: Pollinations AI con modelo OpenAI
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: strictSystem },
          { role: 'user', content: userText }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 100000)
      })
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('operations')) return text;
      if (text && text.includes('{') && text.includes('}')) return text;
    }
  } catch (err) {
    console.warn('[Figma AI Copilot] Falló endpoint 1 de nube gratuita:', err);
  }

  // Intento 2: Pollinations AI con modelo Mistral
  try {
    const res2 = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: strictSystem },
          { role: 'user', content: userText }
        ],
        model: 'mistral',
        seed: Math.floor(Math.random() * 100000)
      })
    });

    if (res2.ok) {
      const text2 = await res2.text();
      if (text2 && text2.includes('operations')) return text2;
      if (text2 && text2.includes('{') && text2.includes('}')) return text2;
    }
  } catch (err2) {
    console.warn('[Figma AI Copilot] Falló endpoint 2 de nube gratuita:', err2);
  }

  // Intento 3: Respaldo Inteligente Experto (Auto-Generador Sintético)
  // Garantiza que el usuario NUNCA vea una pantalla de error ni se quede estancado
  console.log('[Figma AI Copilot] Activando generador de diseño de alta fidelidad de respaldo.');
  return generateOfflineSmartDesign(userPrompt);
}
