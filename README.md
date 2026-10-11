# 🚀 Figma AI Copilot (bscl)

Un plugin de diseño asistido por Inteligencia Artificial para Figma. Diseñado para funcionar de manera **completamente autónoma y portable**: cualquiera puede abrirlo en Figma, colocar su clave de **Google Gemini Pro** (o OpenAI / Groq) y empezar a crear, editar y organizar diseños directamente en el lienzo mediante chat en tiempo real.

---

## 🌟 Características Principales

1. **100% Autónomo (Plug & Play)**:
   - **No requiere instalar Node.js ni correr terminales locales**.
   - Se conecta directamente con la API oficial de **Google Gemini Pro** (o OpenAI / Groq).
   - Opcionalmente, soporta conexión local con **Antigravity / Smart AI Router** si tú deseas trabajar de forma local.

2. **Acciones Reales en el Lienzo de Figma**:
   - `CREATE_FRAME`: Pantallas móviles, tarjetas, modales y navbars con **Auto-Layout dinámico** (Horizontal/Vertical), padding y espaciados automáticos.
   - `CREATE_TEXT`: Textos y títulos con carga asíncrona de tipografías (`Inter`, `Roboto`, etc.) y pesos configurables.
   - `CREATE_RECTANGLE` / `CREATE_ELLIPSE`: Formas geométricas, esquinas redondeadas (`cornerRadius`) y paletas modernas.
   - `EDIT_NODE`: Modifica colores, dimensiones, radios de esquina o textos de capas existentes.
   - `APPLY_AUTOLAYOUT`: Convierte selecciones desordenadas en contenedores limpios y estructurados.

3. **Lectura del Contexto de Selección**:
   - Detecta qué capas tienes seleccionadas en Figma y las envía al modelo de IA para que pueda rediseñarlas, alinearlas o cambiar sus estilos.

4. **Interfaz Refero AAA (Glassmorphism & Dark Mode)**:
   - Inspirada en productos como Linear, Arc y Apple.
   - Acceso con un clic a atajos rápidos: *"📱 Mobile Frame"*, *"🔘 Botón Moderno"*, *"🃏 Card de Producto"*, *"📐 Auto-Layout"* y *"🎨 Modo Oscuro"*.

---

## 🛠️ Instalación en Figma (Paso a Paso en 1 Minuto)

Cualquier persona a la que le compartas esta carpeta puede instalar el plugin siguiendo estos pasos:

1. Abre **Figma** (en la app de escritorio o en el navegador).
2. Abre cualquier archivo de diseño (nuevo o existente).
3. Ve al menú superior izquierdo de Figma (o presiona `Ctrl + /` en Windows / `Cmd + /` en Mac):
   - Ve a **Plugins** > **Development** > **Import plugin from manifest...**
4. Selecciona el archivo `manifest.json` ubicado en la raíz de esta carpeta.
5. ¡Listo! Para abrir el plugin:
   - Haz clic derecho en el lienzo > **Plugins** > **Development** > **Figma AI Copilot (bscl)**.

---

## 🔑 Configuración de Google Gemini Pro

1. Al abrir el plugin en Figma, haz clic en el ícono de **Engranaje (⚙️)** en la esquina superior derecha.
2. Por defecto estará seleccionado **✨ Google Gemini Pro**.
3. Pega tu API Key de Gemini:
   - Si no tienes una, puedes generarla gratis en [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Haz clic en **"Guardar Ajustes"**.
5. ¡Listo! Tu plugin recordará la clave en tu navegador/Figma y ya puedes chatear con la IA para diseñar.

---

## 🪐 Modo Antigravity (Para Desarrolladores Locales)

Si estás trabajando en tu entorno local y quieres que el plugin use tu puente de desarrollo o modelos locales:
1. En el engranaje (⚙️), selecciona el proveedor **🪐 Antigravity / Smart Router (:3000)**.
2. Configura la URL local (`http://localhost:3000`).
3. El plugin canalizará las peticiones a través de tu entorno local de IA.

---

## 💡 Ejemplos de lo que puedes pedirle al Chat

* *"Crea una tarjeta de producto moderna para unos tenis deportivos con foto arriba, nombre, precio de $129 y botón de comprar violeta."*
* *"Diseña una barra de navegación (Navbar) oscura con logo a la izquierda, 4 enlaces y botón de perfil."*
* *"Selecciona estos 3 elementos y aplícales auto-layout horizontal con 20px de separación."*
* *"Convierte el fondo del frame seleccionado a #0F172A y pon todos los textos en blanco."*
