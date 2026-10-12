# 🚀 Figma AI Copilot (bscl)

Un plugin de diseño asistido por Inteligencia Artificial para Figma. Diseñado para funcionar de manera **completamente autónoma, modular y portable**: cualquiera puede abrirlo en Figma, colocar su clave de **Google Gemini Pro** (o OpenAI / Groq / OpenRouter) y empezar a crear, editar y organizar diseños directamente en el lienzo mediante chat en tiempo real.

---

## 🌟 Características Principales

1. **100% Autónomo (Plug & Play)**:
   - Se conecta directamente con la API oficial de **Google Gemini** (modelo recomendado: `gemini-3.8-flash` con fallback automático en cascada).
   - Compatible también con **OpenAI (GPT-4o)**, **Groq Cloud (Llama 3.3 / Qwen)**, **OpenRouter** y servidores locales (**Antigravity / Smart AI Router :3000**).
   - **Persistencia Robusta (`figma.clientStorage`)**: Claves y ajustes guardados de forma nativa en Figma, blindados contra bloqueos de `localStorage` (`DOMException`) en entornos con sandbox.

2. **Componentes y Acciones Nativas en Figma**:
   - `CREATE_FRAME`: Pantallas móviles (iPhone 393x852), tarjetas, modales y navbars con **Auto-Layout dinámico** (Horizontal/Vertical), padding y espaciados automáticos.
   - `CREATE_BUTTON`: Botones reales con auto-layout, variantes oficiales (`PRIMARY`, `SECONDARY`, `OUTLINE`, `GITHUB`) y soporte para iconos vectoriales.
   - `CREATE_ICON`: Catálogo integrado de más de 20 iconos vectoriales limpios de **Bootstrap Icons** (`shield-check`, `search`, `house`, `bell`, `person`, `gear`, `star`, `code-slash`, `git`, `eye`, `cart`, `bag`, `lock`, `envelope`, etc.) renderizados vía `createNodeFromSvg`.
   - `CREATE_INTERACTIVE_BUTTON`: Genera **Component Sets con Variantes nativas de Figma** (`Default` y `Hover`) y configura automáticamente conexiones de prototipado (**Smart Animate While Hovering**). Se integra de forma segura sin romper layouts anidados.
   - `CREATE_BADGE`: Etiquetas tipo píldora (`Public`, `Beta`, `Nuevo`).
   - `CREATE_INPUT`: Campos de texto con placeholder para formularios de Login y Registro.
   - `CREATE_TEXT`: Textos y títulos con carga asíncrona de tipografías (`Inter`, `Roboto`, etc.) y pesos configurables.
   - `CREATE_RECTANGLE` / `CREATE_ELLIPSE`: Formas geométricas, placeholders de imagen y avatares.
   - `EDIT_NODE`: Modifica colores, dimensiones, radios de esquina o textos de capas existentes.
   - `APPLY_AUTOLAYOUT`: Convierte selecciones desordenadas en contenedores limpios y estructurados.

3. **Visión Multimodal (Vision-to-Design)**:
   - **Capturar desde Figma**: Botón de cámara para capturar la capa o imagen seleccionada y recrearla fielmente con componentes reales.
   - **Subir Imagen Local**: Permite cargar imágenes o capturas de pantalla desde tu computadora para clonar mockups.

4. **Arquitectura Modular Senior (< 180 líneas por archivo)**:
   - Código desacoplado siguiendo el principio de responsabilidad única (Regla 5 Anti God-Class):
     - `src/plugin/`: Módulos de sandbox (`main.js`, `dispatcher.js`, `helpers.js`, `icons.js`, `operations/`).
     - `src/ui/`: Módulos de interfaz (`state.js`, `ai-service.js`, `dsl-parser.js`, `ui-controller.js`, `chat-view.js`, `settings-view.js`, `image-handler.js`, `styles/copilot.css`).
   - Empaquetador ultra rápido con `esbuild` (`npm run build`).

---

## 🛠️ Instalación en Figma (Paso a Paso en 1 Minuto)

1. Abre **Figma** (en la app de escritorio o en el navegador).
2. Abre cualquier archivo de diseño (nuevo o existente).
3. Ve al menú superior izquierdo de Figma (o presiona `Ctrl + /` en Windows / `Cmd + /` en Mac):
   - Ve a **Plugins** > **Development** > **Import plugin from manifest...**
4. Selecciona el archivo `manifest.json` ubicado en la raíz de esta carpeta.
5. ¡Listo! Para abrir el plugin:
   - Haz clic derecho en el lienzo > **Plugins** > **Development** > **Figma AI Copilot (bscl)**.

---

## 🔑 Configuración de Google Gemini

1. Al abrir el plugin en Figma, haz clic en el ícono de **Engranaje (⚙️)** en la esquina superior derecha.
2. Por defecto estará seleccionado **✨ Google Gemini Pro** con el modelo `gemini-3.8-flash`.
3. Pega tu API Key de Gemini:
   - Si no tienes una, puedes generarla gratis en [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Haz clic en **"Guardar Ajustes"**.
5. ¡Listo! Tu plugin recordará la clave tanto en `figma.clientStorage` como en almacenamiento local.

---

## 💻 Desarrollo y Compilación Modular

Si deseas modificar el código fuente modular:

```bash
# Instalar dependencias (esbuild)
npm install

# Compilar código modular a los artefactos de Figma (code.js y ui.html)
npm run build
```

---

## 💡 Ejemplos de lo que puedes pedirle al Chat

* *"Crea un mockup completo de la página de repositorio de GitHub: header oscuro con buscador y logo, barra de repositorio con nombre y badge Public, botones de Watch, Fork y Star con iconos, pestañas de navegación y botón verde <> Code."*
* *"Crea un diseño completo mobile de alta fidelidad para una repostería artesanal gourmet: login con inputs y botón interactivo, y catálogo con cards de pasteles, precios destacados y botones de compra."*
* *"Crea un botón interactivo con variante hover que cambie de color suavemente al pasar el mouse por encima."*
* *(Con una imagen seleccionada o adjunta)*: *"Recrea este diseño en Figma con componentes reales y Auto-Layout."*
