/**
 * Figma AI Copilot - Manejo de Previsualización y Captura de Imágenes
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { setActiveImage, clearActiveImage } from './state.js';
import { showToast } from './dom-utils.js';

export function handleSelectionImageReceived(data) {
  let b64 = data.base64;
  if (!b64 && data.bytes) {
    let bin = '';
    const bytes = new Uint8Array(data.bytes);
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    b64 = btoa(bin);
  }
  if (b64) {
    const fullUrl = `data:${data.mimeType || 'image/png'};base64,${b64}`;
    setImagePreview(fullUrl, `📸 Capa: ${data.nodeName || 'Selección'}`);
    showToast('Imagen capturada de Figma. Lista para recrear.', 'success');
  } else {
    showToast('No se pudo convertir la imagen a formato Base64', 'error');
  }
}

export function setImagePreview(dataUrl, label = '📸 Imagen de referencia') {
  setActiveImage(dataUrl);
  const container = document.getElementById('imagePreviewContainer');
  const thumb = document.getElementById('imagePreviewThumb');
  const text = document.getElementById('imagePreviewText');
  const input = document.getElementById('promptInput');

  if (thumb) thumb.src = dataUrl;
  if (text) text.textContent = label;
  if (container) container.style.display = 'flex';
  if (input && !input.value) input.value = 'Recrea este diseño en Figma con componentes reales y Auto-Layout';
}

export function clearPreview() {
  clearActiveImage();
  const container = document.getElementById('imagePreviewContainer');
  const thumb = document.getElementById('imagePreviewThumb');
  const upload = document.getElementById('inputUploadImage');
  if (thumb) thumb.src = '';
  if (container) container.style.display = 'none';
  if (upload) upload.value = '';
}
