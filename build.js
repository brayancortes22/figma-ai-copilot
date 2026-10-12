/**
 * Figma AI Copilot - Script de Build & Empaquetado Automático
 * Autor: Brayan Stid Cortés Lombana (bscl)
 * 
 * Empaqueta src/plugin/main.js en IIFE para QuickJS Sandbox de Figma,
 * y embebe CSS/JS de src/ui en ui.html y src/ui.html.
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

async function build() {
  console.log('🚀 Iniciando build de Figma AI Copilot...');

  // 1. Compilar plugin sandbox (código de backend de Figma)
  const pluginEntry = path.join(__dirname, 'src', 'plugin', 'main.js');
  const pluginBundle = await esbuild.build({
    entryPoints: [pluginEntry],
    bundle: true,
    format: 'iife',
    target: 'es6',
    write: false,
    platform: 'neutral'
  });

  const pluginCode = pluginBundle.outputFiles[0].text;
  const outCodeRoot = path.join(__dirname, 'code.js');
  const outCodeSrc = path.join(__dirname, 'src', 'code.js');

  fs.writeFileSync(outCodeRoot, pluginCode, 'utf-8');
  fs.writeFileSync(outCodeSrc, pluginCode, 'utf-8');
  console.log(`✅ Sandbox del Plugin compilado (code.js y src/code.js): ${Math.round(pluginCode.length / 1024)} KB`);

  // 2. Compilar scripts de la UI frontend
  const uiScriptEntry = path.join(__dirname, 'src', 'ui', 'scripts', 'main.js');
  const uiBundle = await esbuild.build({
    entryPoints: [uiScriptEntry],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false
  });

  const uiScriptCode = uiBundle.outputFiles[0].text;

  // 3. Leer CSS y plantilla HTML
  const cssPath = path.join(__dirname, 'src', 'ui', 'styles', 'copilot.css');
  const htmlPath = path.join(__dirname, 'src', 'ui', 'index.html');

  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  // 4. Embeber CSS y JS compilados dentro del HTML para Figma __html__
  htmlContent = htmlContent.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["'][^"']*copilot\.css["'][^>]*>/i,
    `<style>\n${cssContent}\n</style>`
  );

  htmlContent = htmlContent.replace(
    /<script\s+type=["']module["']\s+src=["'][^"']*main\.js["'][^>]*><\/script>/i,
    `<script>\n${uiScriptCode}\n</script>`
  );

  const outUiRoot = path.join(__dirname, 'ui.html');
  const outUiSrc = path.join(__dirname, 'src', 'ui.html');

  fs.writeFileSync(outUiRoot, htmlContent, 'utf-8');
  fs.writeFileSync(outUiSrc, htmlContent, 'utf-8');
  console.log(`✅ UI empaquetada e inyectada (ui.html y src/ui.html): ${Math.round(htmlContent.length / 1024)} KB`);
  console.log('🎉 Build completado con éxito.');
}

build().catch((err) => {
  console.error('❌ Error fatal durante el build:', err);
  process.exit(1);
});
