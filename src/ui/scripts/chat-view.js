/**
 * Figma AI Copilot - Renderizado de Mensajes de Chat y Burbujas Refero AAA
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { escapeHtml, formatTimestamp, formatMarkdownBasic } from './dom-utils.js';

export function appendUserMessage(text) {
  const container = document.getElementById('chatContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'message-row user';
  row.innerHTML = `
    <div class="message-bubble">
      <div class="message-header"><span class="message-time">${formatTimestamp()}</span></div>
      <p>${escapeHtml(text)}</p>
    </div>`;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

export function appendAIMessage(rawText, dslOperations, onReExecute) {
  const container = document.getElementById('chatContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'message-row ai';
  const cleanText = rawText.replace(/```(?:json)?\s*[\s\S]*?\s*```/g, '').trim() || 'He preparado las operaciones solicitadas.';

  let dslBtnHtml = '';
  if (dslOperations && dslOperations.length > 0) {
    const count = dslOperations.length;
    dslBtnHtml = `
      <div class="dsl-action-card">
        <div class="dsl-action-info"><span>⚡ <strong>${count}</strong> ${count > 1 ? 'operaciones listas' : 'operación lista'}</span></div>
        <button class="dsl-action-btn" data-reexecute="true"><span>Re-ejecutar</span></button>
      </div>`;
  }

  row.innerHTML = `
    <div class="message-avatar ai">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="message-bubble">
      <div class="message-header"><span class="message-author">Figma AI Copilot</span><span class="message-time">${formatTimestamp()}</span></div>
      <div>${formatMarkdownBasic(cleanText)}</div>
      ${dslBtnHtml}
    </div>`;

  if (dslOperations && dslOperations.length > 0 && onReExecute) {
    row.querySelector('[data-reexecute="true"]')?.addEventListener('click', () => onReExecute(dslOperations));
  }
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

export function showTypingIndicator() {
  const container = document.getElementById('chatContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'message-row ai';
  row.id = 'activeTypingIndicator';
  row.innerHTML = `
    <div class="message-avatar ai"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>
    <div class="message-bubble"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

export function removeTypingIndicator() {
  document.getElementById('activeTypingIndicator')?.remove();
}
