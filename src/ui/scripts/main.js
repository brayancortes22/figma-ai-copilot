/**
 * Figma AI Copilot - Punto de Entrada de Scripts de UI
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

import { initUI } from './ui-controller.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initUI();
  });
} else {
  initUI();
}
