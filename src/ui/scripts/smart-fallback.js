/**
 * Figma AI Copilot - Generador Sintético de Respaldo Inmediato (Self-Healing Fallback)
 * Garantiza que el usuario NUNCA vea pantallas de error ni se quede estancado
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export function generateOfflineSmartDesign(prompt) {
  const p = (prompt || '').toLowerCase();

  // Caso 1: Repostería / Pastelería / Bakery
  if (p.includes('reposter') || p.includes('pastel') || p.includes('bakery') || p.includes('dulce')) {
    return `He diseñado un prototipo móvil completo para "Maison Sucrée": pantalla de Login con inputs y navegación al Catálogo con cards y botones de compra.

\`\`\`json
{
  "operations": [
    {
      "action": "CREATE_FRAME",
      "name": "1. Login - Maison Sucrée",
      "preset": "iPhone 16",
      "fills": ["#FFFDF9"],
      "layoutMode": "VERTICAL",
      "itemSpacing": 20,
      "padding": { "top": 60, "right": 24, "bottom": 40, "left": 24 },
      "primaryAxisAlignItems": "CENTER",
      "counterAxisAlignItems": "CENTER",
      "children": [
        { "action": "CREATE_ICON", "icon": "heart", "size": 36, "color": "#D4A373" },
        { "action": "CREATE_TEXT", "characters": "Maison Sucrée", "fontSize": 28, "fontWeight": "BOLD", "fills": ["#5A3E2B"] },
        { "action": "CREATE_TEXT", "characters": "Repostería Artesanal Gourmet", "fontSize": 14, "fills": ["#8C6D58"] },
        { "action": "CREATE_INPUT", "name": "Email Input", "placeholder": "chef@maisonsucree.com", "width": 345, "height": 48 },
        { "action": "CREATE_INPUT", "name": "Password Input", "placeholder": "••••••••", "width": 345, "height": 48 },
        {
          "action": "CREATE_BUTTON",
          "name": "Boton Entrar",
          "label": "Entrar al Catálogo 🥐",
          "variant": "PRIMARY",
          "fills": ["#D4A373"],
          "textColor": "#FFFFFF",
          "width": 345,
          "height": 48,
          "cornerRadius": 12,
          "interaction": { "trigger": "ON_CLICK", "destination": "2. Catálogo - Maison Sucrée", "transition": "SMART_ANIMATE" }
        },
        { "action": "CREATE_TEXT", "characters": "¿Olvidaste tu contraseña?", "fontSize": 12, "fills": ["#A98467"] }
      ]
    },
    {
      "action": "CREATE_FRAME",
      "name": "2. Catálogo - Maison Sucrée",
      "preset": "iPhone 16",
      "overflow": "VERTICAL",
      "fills": ["#FAF7F2"],
      "layoutMode": "VERTICAL",
      "itemSpacing": 16,
      "padding": { "top": 50, "right": 20, "bottom": 40, "left": 20 },
      "children": [
        {
          "action": "CREATE_FRAME",
          "name": "Header Catálogo",
          "layoutMode": "HORIZONTAL",
          "primaryAxisAlignItems": "SPACE_BETWEEN",
          "counterAxisAlignItems": "CENTER",
          "width": 353,
          "height": 44,
          "fills": ["#00000000"],
          "children": [
            {
              "action": "CREATE_BUTTON",
              "label": "Login",
              "variant": "OUTLINE",
              "icon": "arrow-left",
              "textColor": "#5A3E2B",
              "cornerRadius": 8,
              "interaction": { "trigger": "ON_CLICK", "destination": "1. Login - Maison Sucrée", "transition": "SMART_ANIMATE" }
            },
            { "action": "CREATE_TEXT", "characters": "Nuestros Pasteles", "fontSize": 20, "fontWeight": "BOLD", "fills": ["#432818"] },
            { "action": "CREATE_ICON", "icon": "bag", "size": 22, "color": "#D4A373" }
          ]
        },
        {
          "action": "CREATE_FRAME",
          "name": "Card Pastel 1",
          "layoutMode": "VERTICAL",
          "fills": ["#FFFFFF"],
          "cornerRadius": 16,
          "padding": { "top": 14, "right": 14, "bottom": 14, "left": 14 },
          "itemSpacing": 10,
          "width": 353,
          "dropShadow": { "color": "#00000010", "blur": 10, "y": 4 },
          "children": [
            { "action": "CREATE_RECTANGLE", "name": "Foto Red Velvet", "width": 325, "height": 130, "fills": ["#E9D8A6"], "cornerRadius": 10 },
            { "action": "CREATE_TEXT", "characters": "Torta Red Velvet Artesanal", "fontSize": 16, "fontWeight": "BOLD", "fills": ["#432818"] },
            { "action": "CREATE_TEXT", "characters": "Bizcocho suave de cacao con crema mascarpone", "fontSize": 12, "fills": ["#7F5539"] },
            {
              "action": "CREATE_FRAME",
              "name": "Footer Card",
              "layoutMode": "HORIZONTAL",
              "primaryAxisAlignItems": "SPACE_BETWEEN",
              "counterAxisAlignItems": "CENTER",
              "width": 325,
              "children": [
                { "action": "CREATE_TEXT", "characters": "$28.50 USD", "fontSize": 18, "fontWeight": "BOLD", "fills": ["#BB3E03"] },
                { "action": "CREATE_INTERACTIVE_BUTTON", "label": "Comprar", "baseColor": "#D4A373", "hoverColor": "#BC8A5A", "cornerRadius": 8 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\``;
  }

  // Caso 2: Login / Autenticación / Recrear Pantalla Móvil
  if (p.includes('login') || p.includes('autentica') || p.includes('sesi') || p.includes('recrea') || p.includes('auth')) {
    return `He recreado la pantalla móvil con Auto-Layout, barra de estado, campos de entrada y botón de acción.

\`\`\`json
{
  "operations": [
    {
      "action": "CREATE_FRAME",
      "name": "LoginScreen",
      "preset": "iPhone 16",
      "fills": ["#FFFFFF"],
      "layoutMode": "VERTICAL",
      "itemSpacing": 20,
      "padding": { "top": 54, "right": 24, "bottom": 36, "left": 24 },
      "primaryAxisAlignItems": "CENTER",
      "counterAxisAlignItems": "CENTER",
      "children": [
        {
          "action": "CREATE_FRAME",
          "name": "StatusBar",
          "layoutMode": "HORIZONTAL",
          "primaryAxisAlignItems": "SPACE_BETWEEN",
          "counterAxisAlignItems": "CENTER",
          "width": 345,
          "height": 24,
          "fills": ["#00000000"],
          "children": [
            { "action": "CREATE_TEXT", "characters": "9:41", "fontSize": 14, "fontWeight": "BOLD", "fills": ["#000000"] },
            { "action": "CREATE_ICON", "icon": "bell", "size": 16, "color": "#000000" }
          ]
        },
        { "action": "CREATE_RECTANGLE", "name": "Illustration Placeholder", "width": 110, "height": 110, "cornerRadius": 24, "fills": ["#EEF2FF"], "dropShadow": { "blur": 12, "y": 4, "opacity": 0.1 } },
        { "action": "CREATE_TEXT", "characters": "Iniciar Sesión", "fontSize": 24, "fontWeight": "BOLD", "fills": ["#111827"] },
        { "action": "CREATE_TEXT", "characters": "Ingresa tus credenciales para continuar", "fontSize": 13, "fills": ["#6B7280"] },
        { "action": "CREATE_INPUT", "name": "Email Input", "placeholder": "usuario@ejemplo.com", "width": 345, "height": 48 },
        { "action": "CREATE_INPUT", "name": "Password Input", "placeholder": "••••••••", "width": 345, "height": 48 },
        { "action": "CREATE_INTERACTIVE_BUTTON", "label": "Iniciar Sesión", "baseColor": "#4F46E5", "hoverColor": "#4338CA", "cornerRadius": 10 },
        { "action": "CREATE_TEXT", "characters": "¿Olvidaste tu contraseña?", "fontSize": 12, "fills": ["#4F46E5"] }
      ]
    }
  ]
}
\`\`\``;
  }

  // Caso 3: Mockup genérico Refero AAA
  return `He preparado la estructura en Figma con componentes reales y Auto-Layout.

\`\`\`json
{
  "operations": [
    {
      "action": "CREATE_FRAME",
      "name": "Screen - Diseño Refero AAA",
      "preset": "iPhone 16",
      "fills": ["#0D1117"],
      "layoutMode": "VERTICAL",
      "itemSpacing": 16,
      "padding": { "top": 48, "right": 20, "bottom": 32, "left": 20 },
      "children": [
        { "action": "CREATE_TEXT", "characters": "Diseño UI Generado", "fontSize": 24, "fontWeight": "BOLD", "fills": ["#F0F6FC"] },
        { "action": "CREATE_TEXT", "characters": "Componente generado con Auto-Layout y fidelidad AAA", "fontSize": 14, "fills": ["#8B949E"] },
        { "action": "CREATE_INTERACTIVE_BUTTON", "label": "Comenzar Ahora", "baseColor": "#6366F1", "hoverColor": "#4F46E5", "cornerRadius": 8 }
      ]
    }
  ]
}
\`\`\``;
}
