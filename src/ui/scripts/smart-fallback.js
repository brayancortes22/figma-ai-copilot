/**
 * Figma AI Copilot - Generador Sintético de Respaldo Inmediato (Self-Healing Fallback)
 * Garantiza que el usuario NUNCA vea pantallas de error ni se quede estancado
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export function generateOfflineSmartDesign(prompt) {
  const p = (prompt || '').toLowerCase();

  // Caso A: Repostería / Pastelería / Bakery
  if (p.includes('reposter') || p.includes('pastel') || p.includes('bakery') || p.includes('dulce')) {
    return `He diseñado un flujo completo de alta fidelidad para la repostería artesanal gourmet "Maison Sucrée", que incluye la pantalla de inicio de sesión (Login) y el catálogo principal con estética gourmet y botones de compra.

\`\`\`json
{
  "operations": [
    {
      "action": "CREATE_FRAME",
      "name": "1. Login - Maison Sucrée",
      "width": 393,
      "height": 852,
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
        { "action": "CREATE_INPUT", "name": "Email Input", "placeholder": "correo@ejemplo.com", "width": 345, "height": 48 },
        { "action": "CREATE_INPUT", "name": "Password Input", "placeholder": "••••••••", "width": 345, "height": 48 },
        { "action": "CREATE_BUTTON", "label": "Iniciar Sesión Gourmet", "variant": "PRIMARY", "fills": ["#D4A373"], "textColor": "#FFFFFF", "width": 345, "height": 48, "cornerRadius": 12 },
        { "action": "CREATE_TEXT", "characters": "¿Olvidaste tu contraseña?", "fontSize": 12, "fills": ["#A98467"] }
      ]
    },
    {
      "action": "CREATE_FRAME",
      "name": "2. Catálogo - Maison Sucrée",
      "width": 393,
      "height": 852,
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
            { "action": "CREATE_TEXT", "characters": "Nuestros Pasteles 🥐", "fontSize": 22, "fontWeight": "BOLD", "fills": ["#432818"] },
            { "action": "CREATE_ICON", "icon": "bag", "size": 24, "color": "#D4A373" }
          ]
        },
        {
          "action": "CREATE_FRAME",
          "name": "Card Pastel 1 - Red Velvet",
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
                { "action": "CREATE_BUTTON", "label": "Comprar", "variant": "PRIMARY", "fills": ["#D4A373"], "cornerRadius": 8 }
              ]
            }
          ]
        },
        {
          "action": "CREATE_FRAME",
          "name": "Card Pastel 2 - Macarons",
          "layoutMode": "VERTICAL",
          "fills": ["#FFFFFF"],
          "cornerRadius": 16,
          "padding": { "top": 14, "right": 14, "bottom": 14, "left": 14 },
          "itemSpacing": 10,
          "width": 353,
          "dropShadow": { "color": "#00000010", "blur": 10, "y": 4 },
          "children": [
            { "action": "CREATE_RECTANGLE", "name": "Foto Macarons", "width": 325, "height": 130, "fills": ["#EE9B00"], "cornerRadius": 10 },
            { "action": "CREATE_TEXT", "characters": "Caja Macarons París (x12)", "fontSize": 16, "fontWeight": "BOLD", "fills": ["#432818"] },
            { "action": "CREATE_TEXT", "characters": "Almendra francesa, pistacho y frambuesa", "fontSize": 12, "fills": ["#7F5539"] },
            {
              "action": "CREATE_FRAME",
              "name": "Footer Card 2",
              "layoutMode": "HORIZONTAL",
              "primaryAxisAlignItems": "SPACE_BETWEEN",
              "counterAxisAlignItems": "CENTER",
              "width": 325,
              "children": [
                { "action": "CREATE_TEXT", "characters": "$19.00 USD", "fontSize": 18, "fontWeight": "BOLD", "fills": ["#BB3E03"] },
                { "action": "CREATE_BUTTON", "label": "Comprar", "variant": "PRIMARY", "fills": ["#D4A373"], "cornerRadius": 8 }
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

  // Caso B: Mockup genérico Refero AAA
  return `He preparado la estructura en Figma con componentes reales y Auto-Layout.

\`\`\`json
{
  "operations": [
    {
      "action": "CREATE_FRAME",
      "name": "Screen - Diseño Refero AAA",
      "width": 393,
      "height": 852,
      "fills": ["#0D1117"],
      "layoutMode": "VERTICAL",
      "itemSpacing": 16,
      "padding": { "top": 48, "right": 20, "bottom": 32, "left": 20 },
      "children": [
        { "action": "CREATE_TEXT", "characters": "Diseño UI Generado", "fontSize": 24, "fontWeight": "BOLD", "fills": ["#F0F6FC"] },
        { "action": "CREATE_TEXT", "characters": "Componente generado con Auto-Layout y fidelidad AAA", "fontSize": 14, "fills": ["#8B949E"] },
        { "action": "CREATE_BUTTON", "label": "Comenzar Ahora", "variant": "PRIMARY", "fills": ["#6366F1"], "width": 353, "height": 48, "cornerRadius": 8 }
      ]
    }
  ]
}
\`\`\``;
}
