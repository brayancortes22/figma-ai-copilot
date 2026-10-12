/**
 * Figma AI Copilot - Catálogo Oficial de Presets de Dispositivos de Figma
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export const DEVICE_PRESETS = {
  // iPhone
  'IPHONE_17': { width: 402, height: 874, name: 'iPhone 17' },
  'IPHONE_16_17_PRO': { width: 402, height: 874, name: 'iPhone 16 & 17 Pro' },
  'IPHONE_16': { width: 393, height: 852, name: 'iPhone 16' },
  'IPHONE_16_17_PRO_MAX': { width: 440, height: 956, name: 'iPhone 16 & 17 Pro Max' },
  'IPHONE_16_PLUS': { width: 430, height: 932, name: 'iPhone 16 Plus' },
  'IPHONE_AIR': { width: 420, height: 912, name: 'iPhone Air' },
  'IPHONE_14_15_PRO': { width: 393, height: 852, name: 'iPhone 14 & 15 Pro' },
  'IPHONE_14_15_PRO_MAX': { width: 430, height: 932, name: 'iPhone 14 & 15 Pro Max' },
  'IPHONE_13_14': { width: 390, height: 844, name: 'iPhone 13 & 14' },
  'IPHONE_14_PLUS': { width: 428, height: 926, name: 'iPhone 14 Plus' },

  // Android
  'ANDROID_COMPACT': { width: 412, height: 917, name: 'Android Compact' },
  'ANDROID_MEDIUM': { width: 700, height: 840, name: 'Android Medium' },
  'ANDROID_EXPANDED': { width: 1280, height: 800, name: 'Android Expanded' },

  // Tablets & Desktop
  'IPAD_MINI': { width: 744, height: 1133, name: 'iPad mini 8.3' },
  'IPAD_PRO_11': { width: 834, height: 1194, name: 'iPad Pro 11"' },
  'IPAD_PRO_12_9': { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
  'SURFACE_PRO_8': { width: 1440, height: 960, name: 'Surface Pro 8' },
  'DESKTOP': { width: 1440, height: 900, name: 'Desktop' }
};

export function resolveDevicePreset(op) {
  if (!op) return null;
  const raw = String(op.preset || op.device || op.devicePreset || '').toUpperCase().trim();
  if (!raw) return null;

  const normalized = raw.replace(/[^A-Z0-9]/g, '_').replace(/__+/g, '_');

  for (const [key, preset] of Object.entries(DEVICE_PRESETS)) {
    if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
      return preset;
    }
  }

  // Búsquedas flexibles comunes
  if (normalized.includes('IPHONE_17')) return DEVICE_PRESETS.IPHONE_17;
  if (normalized.includes('IPHONE_16_PRO_MAX') || normalized.includes('PRO_MAX')) return DEVICE_PRESETS.IPHONE_16_17_PRO_MAX;
  if (normalized.includes('IPHONE_16') || normalized.includes('IPHONE') || normalized.includes('MOBILE')) return DEVICE_PRESETS.IPHONE_16;
  if (normalized.includes('ANDROID')) return DEVICE_PRESETS.ANDROID_COMPACT;
  if (normalized.includes('IPAD') || normalized.includes('TABLET')) return DEVICE_PRESETS.IPAD_PRO_11;
  if (normalized.includes('DESKTOP') || normalized.includes('WEB') || normalized.includes('LAPTOP')) return DEVICE_PRESETS.DESKTOP;

  return null;
}
