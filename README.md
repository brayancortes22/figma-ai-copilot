# 🚀 Figma AI Copilot (bscl)

Un plugin de diseño asistido por Inteligencia Artificial para Figma. Diseñado para funcionar de manera **completamente autónoma, modular y sin fricción técnica**: cualquier persona puede abrirlo y empezar a diseñar de inmediato, sin necesidad de saber programar, sin servidores locales obligatorios y **sin bloqueos por límites de cuota**.

---

## 🌟 Características Principales

1. **🤖 Modo Inteligente Automático (Auto-Smart Cascade - Nunca se bloquea)**:
   - **Gestión Inteligente de Cuota y Tráfico**: Si la API de Google Gemini llega a saturarse, devuelve error 429 (`Quota exceeded / limit: 0`) o alta demanda (503), el plugin **no se rompe**; salta en milisegundos al siguiente modelo de la lista (`gemini-3.8-flash` ➔ `3.6-flash` ➔ `3.5-flash` ➔ `2.5-flash` ➔ `2.5-flash-lite`).
   - Si toda la cuota diaria gratuita de Gemini se agota por completo, o si el usuario no tiene una clave, el sistema **conmuta automáticamente a la Nube Gratuita Pública**, garantizando que el diseñador pueda seguir creando sin interrupción.

2. **🌐 Nube Gratuita Pública (Sin API Key - 100% Libre)**:
   - Diseñado especialmente para personas y diseñadores que no quieren registrarse en consolas de desarrolladores o pegar claves complejas.
   - Funciona de forma instantánea usando modelos cloud de alta velocidad (OpenAI, Llama 3.3, Mistral, Qwen).

3. **✨ Soporte Multimodelo y Multi-Proveedor (2026)**:
   - **Cerebras Cloud**: ¡**1 Millón de tokens gratis al día** sin tarjeta de crédito a 2.600 t/s con `llama-3.3-70b`!
   - **Groq Cloud**: Inferencia ultra veloz a más de 500 tokens/segundo con `llama-3.3-70b-versatile` y `llama-3.1-8b-instant`.
   - **Google Gemini (2026)**: `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`.
   - **OpenRouter**: Acceso a modelos comunitarios gratuitos (`:free`).
   - **OpenAI**: Soporte directo para `gpt-4o` y `gpt-4o-mini`.
   - **Antigravity / Smart Router**: Para desarrolladores que deseen conectar sus modelos locales en `localhost:3000`.

4. **Persistencia Nativa (`figma.clientStorage`)**:
   - Ajustes, preferencias y claves guardadas directamente en el almacenamiento interno de Figma, evitando los bloqueos de `DOMException: SecurityError` habituales de `localStorage` en iframes.

5. **Componentes y Acciones Nativas en Figma**:
   - `CREATE_FRAME`: Pantallas móviles (iPhone 393x852), tarjetas, modales y navbars con **Auto-Layout dinámico** (Horizontal/Vertical), padding y espaciados automáticos.
   - `CREATE_BUTTON`: Botones reales con auto-layout, variantes oficiales (`PRIMARY`, `SECONDARY`, `OUTLINE`, `GITHUB`) e iconos vectoriales integrados.
   - `CREATE_ICON`: Catálogo integrado de más de 20 iconos vectoriales limpios de **Bootstrap Icons** (`shield-check`, `search`, `house`, `bell`, `person`, `gear`, `star`, `code-slash`, `git`, `eye`, `cart`, `bag`, `lock`, `envelope`, etc.) renderizados vía `createNodeFromSvg`.
   - `CREATE_INTERACTIVE_BUTTON`: Genera **Component Sets con Variantes nativas de Figma** (`Default` y `Hover`) y configura automáticamente conexiones de prototipado (**Smart Animate While Hovering**). Se integra de forma segura sin romper layouts anidados.
   - `CREATE_BADGE`: Etiquetas tipo píldora (`Public`, `Beta`, `Nuevo`).
   - `CREATE_INPUT`: Campos de texto con placeholder para formularios de Login y Registro.
   - `CREATE_TEXT`: Textos y títulos con carga asíncrona de tipografías (`Inter`, `Roboto`, etc.) y pesos configurables.
   - `CREATE_RECTANGLE` / `CREATE_ELLIPSE`: Formas geométricas, placeholders de imagen y avatares.
   - `EDIT_NODE`: Modifica colores, dimensiones, radios de esquina o textos de capas existentes.
   - `APPLY_AUTOLAYOUT`: Convierte selecciones desordenadas en contenedores limpios y estructurados.

6. **Visión Multimodal (Vision-to-Design)**:
   - **Capturar desde Figma**: Botón de cámara para capturar la capa o imagen seleccionada y recrearla fielmente con componentes reales.
   - **Subir Imagen Local**: Permite cargar imágenes o capturas de pantalla desde tu computadora para clonar mockups.

7. **Arquitectura Modular Senior (< 180 líneas por archivo - Regla 5)**:
   - `src/plugin/`: Módulos de sandbox (`main.js`, `dispatcher.js`, `helpers.js`, `icons.js`, `operations/`).
   - `src/ui/`: Módulos de interfaz (`state.js`, `ai-service.js`, `gemini-provider.js`, `free-cloud.js`, `dsl-parser.js`, `ui-controller.js`, `chat-view.js`, `settings-view.js`, `image-handler.js`, `styles/copilot.css`).
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

## ⚙️ Configuración (Sencilla para Todos)

1. Al abrir el plugin, por defecto viene activado el **🤖 Modo Inteligente Automático**.
2. **Si no tienes clave:** Puedes usarlo inmediatamente con la **Nube Gratuita**.
3. **Si tienes clave de Google Gemini:** Abre el engranaje ⚙️, pégala y pulsa **Guardar Ajustes**. El plugin la usará y, si alguna vez tu cuota se agota, cambiará automáticamente a la nube de respaldo sin mostrarte errores técnicos.

---

## 💻 Desarrollo y Compilación Modular

```bash
# Compilar código modular a los artefactos finales de Figma (code.js y ui.html)
npm run build
```

---

## 💡 Ejemplos de Prompts

* *"Crea un mockup completo de la página de repositorio de GitHub: header oscuro con buscador y logo, barra de repositorio con nombre y badge Public, botones de Watch, Fork y Star con iconos, pestañas de navegación y botón verde <> Code."*
* *"Crea un diseño completo mobile de alta fidelidad para una repostería artesanal gourmet: login con inputs y botón interactivo, y catálogo con cards de pasteles, precios destacados y botones de compra."*
* *"Crea un botón interactivo con variante hover que cambie de color suavemente al pasar el mouse por encima."*
* *(Con una imagen seleccionada o adjunta)*: *"Recrea este diseño en Figma con componentes reales y Auto-Layout."*
