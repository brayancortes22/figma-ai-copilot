/**
 * Figma AI Copilot - Utilidades de DOM, Markdown y Notificaciones Toast
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatMarkdownBasic(str) {
  let escaped = escapeHtml(str);
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  return escaped.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <span style="cursor: pointer; opacity: 0.7; margin-left: 8px;">✕</span>
  `;
  
  toast.querySelector('span:last-child').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }
  }, 3400);
}

export function setStatus(statusType, label = 'Listo') {
  const badge = document.getElementById('statusBadge');
  const text = document.getElementById('statusText');
  if (!badge || !text) return;

  if (statusType === 'online') {
    text.textContent = `🟢 ${label}`;
    badge.style.color = '#34D399';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.25)';
  } else if (statusType === 'busy') {
    text.textContent = `⚡ ${label}`;
    badge.style.color = '#818CF8';
    badge.style.borderColor = 'rgba(99, 102, 241, 0.35)';
  } else if (statusType === 'error') {
    text.textContent = `🔴 ${label}`;
    badge.style.color = '#F87171';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  }
}
