(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/plugin/helpers.js
  function ensureFontLoaded(family = "Inter", style = "Regular") {
    return __async(this, null, function* () {
      const safeFamily = family || "Inter";
      const safeStyle = style || "Regular";
      try {
        const font = { family: safeFamily, style: safeStyle };
        yield figma.loadFontAsync(font);
        return font;
      } catch (err) {
        try {
          const fallback = { family: "Inter", style: "Regular" };
          yield figma.loadFontAsync(fallback);
          return fallback;
        } catch (e) {
          const roboto = { family: "Roboto", style: "Regular" };
          yield figma.loadFontAsync(roboto);
          return roboto;
        }
      }
    });
  }
  function hexToRgb(hex) {
    if (!hex || typeof hex !== "string") return { r: 0.1, g: 0.1, b: 0.1 };
    let clean = hex.replace("#", "").trim();
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (clean.length !== 6) return { r: 0.2, g: 0.2, b: 0.2 };
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16 & 255) / 255,
      g: (num >> 8 & 255) / 255,
      b: (num & 255) / 255
    };
  }
  function parseColor(input) {
    if (!input) return { r: 0.2, g: 0.2, b: 0.2 };
    if (typeof input === "string") return hexToRgb(input);
    if (typeof input === "object") {
      if ("r" in input && "g" in input && "b" in input) {
        return {
          r: input.r > 1 ? input.r / 255 : input.r,
          g: input.g > 1 ? input.g / 255 : input.g,
          b: input.b > 1 ? input.b / 255 : input.b
        };
      }
    }
    return { r: 0.2, g: 0.2, b: 0.2 };
  }
  function parseFills(fills) {
    if (!fills) return [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    if (Array.isArray(fills)) {
      return fills.map((f) => {
        if (f && f.type === "SOLID" && f.color) return f;
        return { type: "SOLID", color: parseColor(f) };
      });
    }
    const color = parseColor(fills);
    const opacity = typeof fills === "object" && fills.opacity != null ? fills.opacity : 1;
    return [{ type: "SOLID", color, opacity }];
  }
  function applyStrokesAndEffects(node, op) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    if (op.opacity != null && "opacity" in node) {
      const rawOp = Number(op.opacity);
      node.opacity = rawOp > 1 ? rawOp / 100 : Math.max(0, Math.min(1, rawOp));
    }
    if (op.strokes || op.borderColor) {
      node.strokes = parseFills(op.strokes || op.borderColor);
      node.strokeWeight = Number((_b = (_a = op.strokeWeight) != null ? _a : op.borderWidth) != null ? _b : 1);
      if (op.strokeAlign) {
        const align = String(op.strokeAlign).toUpperCase();
        if (["INSIDE", "OUTSIDE", "CENTER"].includes(align)) {
          node.strokeAlign = align;
        }
      }
    }
    if (op.effects && Array.isArray(op.effects)) {
      node.effects = op.effects;
    } else {
      const effs = [];
      if (op.dropShadow || op.shadow) {
        const s = typeof op.dropShadow === "object" ? op.dropShadow : {};
        effs.push({
          type: "DROP_SHADOW",
          color: s.color ? __spreadProps(__spreadValues({}, parseColor(s.color)), { a: (_c = s.opacity) != null ? _c : 0.15 }) : { r: 0, g: 0, b: 0, a: 0.18 },
          offset: { x: Number((_d = s.x) != null ? _d : 0), y: Number((_e = s.y) != null ? _e : 4) },
          radius: Number((_g = (_f = s.blur) != null ? _f : s.radius) != null ? _g : 12),
          spread: Number((_h = s.spread) != null ? _h : 0),
          visible: true,
          blendMode: "NORMAL"
        });
      }
      if (op.innerShadow) {
        const is = typeof op.innerShadow === "object" ? op.innerShadow : {};
        effs.push({
          type: "INNER_SHADOW",
          color: is.color ? __spreadProps(__spreadValues({}, parseColor(is.color)), { a: (_i = is.opacity) != null ? _i : 0.2 }) : { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: Number((_j = is.x) != null ? _j : 0), y: Number((_k = is.y) != null ? _k : 2) },
          radius: Number((_m = (_l = is.blur) != null ? _l : is.radius) != null ? _m : 4),
          spread: Number((_n = is.spread) != null ? _n : 0),
          visible: true,
          blendMode: "NORMAL"
        });
      }
      if (op.backgroundBlur || op.glass) {
        const r = typeof op.backgroundBlur === "number" ? op.backgroundBlur : 16;
        effs.push({ type: "BACKGROUND_BLUR", radius: r, visible: true });
      } else if (op.layerBlur) {
        const r = typeof op.layerBlur === "number" ? op.layerBlur : 12;
        effs.push({ type: "LAYER_BLUR", radius: r, visible: true });
      }
      if (effs.length > 0) node.effects = effs;
    }
  }
  function serializeNode(node) {
    if (!node) return null;
    const item = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y),
      width: Math.round(node.width),
      height: Math.round(node.height),
      visible: node.visible,
      opacity: node.opacity
    };
    if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
      item.cornerRadius = node.cornerRadius;
    }
    if ("fills" in node && Array.isArray(node.fills)) {
      item.fills = node.fills;
    }
    if ("layoutMode" in node) {
      item.layoutMode = node.layoutMode;
    }
    if (node.type === "TEXT") {
      item.characters = node.characters;
      item.fontSize = typeof node.fontSize === "number" ? node.fontSize : 14;
    }
    return item;
  }
  function normalizeOperation(rawOp) {
    if (!rawOp || typeof rawOp !== "object") return {};
    const known = ["CREATE_FRAME", "CREATE_BUTTON", "CREATE_INPUT", "CREATE_TEXT", "CREATE_ICON", "CREATE_BADGE", "CREATE_RECTANGLE", "CREATE_ELLIPSE", "CREATE_INTERACTIVE_BUTTON", "CREATE_COMPONENT_SET"];
    let unwrapped = rawOp;
    for (const k of Object.keys(rawOp)) {
      const upper = k.toUpperCase().trim();
      if (known.includes(upper) && typeof rawOp[k] === "object" && rawOp[k] !== null) {
        unwrapped = __spreadValues({ action: upper }, rawOp[k]);
        break;
      }
    }
    const params = unwrapped.params && typeof unwrapped.params === "object" ? unwrapped.params : {};
    const props = unwrapped.properties && typeof unwrapped.properties === "object" ? unwrapped.properties : {};
    const merged = __spreadValues(__spreadValues(__spreadValues({}, unwrapped), props), params);
    if (merged.size && typeof merged.size === "object") {
      if (merged.size.width) merged.width = merged.size.width;
      if (merged.size.height) merged.height = merged.size.height;
    }
    if (merged.backgroundColor && !merged.fills) {
      merged.fills = [merged.backgroundColor];
    }
    let act = String(merged.action || merged.type || merged.name || "").toUpperCase().trim();
    act = act.replace(/[^A-Z0-9_]/g, "_").replace(/__+/g, "_");
    if (act.includes("FRAME")) merged.action = "CREATE_FRAME";
    else if (act.includes("BUTTON")) merged.action = "CREATE_BUTTON";
    else if (act.includes("INPUT")) merged.action = "CREATE_INPUT";
    else if (act.includes("BADGE")) merged.action = "CREATE_BADGE";
    else if (act.includes("TEXT")) merged.action = "CREATE_TEXT";
    else if (act.includes("RECT")) merged.action = "CREATE_RECTANGLE";
    else if (act.includes("ELLIPSE") || act.includes("CIRCLE")) merged.action = "CREATE_ELLIPSE";
    else if (act.includes("ICON")) merged.action = "CREATE_ICON";
    else merged.action = act || "CREATE_FRAME";
    return merged;
  }
  var init_helpers = __esm({
    "src/plugin/helpers.js"() {
    }
  });

  // src/plugin/presets.js
  function resolveDevicePreset(op) {
    if (!op) return null;
    const raw = String(op.preset || op.device || op.devicePreset || "").toUpperCase().trim();
    if (!raw) return null;
    const normalized = raw.replace(/[^A-Z0-9]/g, "_").replace(/__+/g, "_");
    for (const [key, preset] of Object.entries(DEVICE_PRESETS)) {
      if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
        return preset;
      }
    }
    if (normalized.includes("IPHONE_17")) return DEVICE_PRESETS.IPHONE_17;
    if (normalized.includes("IPHONE_16_PRO_MAX") || normalized.includes("PRO_MAX")) return DEVICE_PRESETS.IPHONE_16_17_PRO_MAX;
    if (normalized.includes("IPHONE_16") || normalized.includes("IPHONE") || normalized.includes("MOBILE")) return DEVICE_PRESETS.IPHONE_16;
    if (normalized.includes("ANDROID")) return DEVICE_PRESETS.ANDROID_COMPACT;
    if (normalized.includes("IPAD") || normalized.includes("TABLET")) return DEVICE_PRESETS.IPAD_PRO_11;
    if (normalized.includes("DESKTOP") || normalized.includes("WEB") || normalized.includes("LAPTOP")) return DEVICE_PRESETS.DESKTOP;
    return null;
  }
  var DEVICE_PRESETS;
  var init_presets = __esm({
    "src/plugin/presets.js"() {
      DEVICE_PRESETS = {
        // iPhone
        "IPHONE_17": { width: 402, height: 874, name: "iPhone 17" },
        "IPHONE_16_17_PRO": { width: 402, height: 874, name: "iPhone 16 & 17 Pro" },
        "IPHONE_16": { width: 393, height: 852, name: "iPhone 16" },
        "IPHONE_16_17_PRO_MAX": { width: 440, height: 956, name: "iPhone 16 & 17 Pro Max" },
        "IPHONE_16_PLUS": { width: 430, height: 932, name: "iPhone 16 Plus" },
        "IPHONE_AIR": { width: 420, height: 912, name: "iPhone Air" },
        "IPHONE_14_15_PRO": { width: 393, height: 852, name: "iPhone 14 & 15 Pro" },
        "IPHONE_14_15_PRO_MAX": { width: 430, height: 932, name: "iPhone 14 & 15 Pro Max" },
        "IPHONE_13_14": { width: 390, height: 844, name: "iPhone 13 & 14" },
        "IPHONE_14_PLUS": { width: 428, height: 926, name: "iPhone 14 Plus" },
        // Android
        "ANDROID_COMPACT": { width: 412, height: 917, name: "Android Compact" },
        "ANDROID_MEDIUM": { width: 700, height: 840, name: "Android Medium" },
        "ANDROID_EXPANDED": { width: 1280, height: 800, name: "Android Expanded" },
        // Tablets & Desktop
        "IPAD_MINI": { width: 744, height: 1133, name: "iPad mini 8.3" },
        "IPAD_PRO_11": { width: 834, height: 1194, name: 'iPad Pro 11"' },
        "IPAD_PRO_12_9": { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
        "SURFACE_PRO_8": { width: 1440, height: 960, name: "Surface Pro 8" },
        "DESKTOP": { width: 1440, height: 900, name: "Desktop" }
      };
    }
  });

  // src/plugin/operations/prototype.js
  function applyScrollBehavior(node, op) {
    if (!node || !("overflowDirection" in node)) return;
    const rawOverflow = String(op.overflow || op.overflowDirection || op.scrollOverflow || "").toUpperCase().trim();
    if (rawOverflow.includes("HORIZ")) {
      node.overflowDirection = "HORIZONTAL_SCROLLING";
    } else if (rawOverflow.includes("VERT")) {
      node.overflowDirection = "VERTICAL_SCROLLING";
    } else if (rawOverflow.includes("BOTH")) {
      node.overflowDirection = "BOTH_SCROLLING";
    } else if (rawOverflow.includes("NONE") || rawOverflow.includes("NO")) {
      node.overflowDirection = "NONE";
    }
    if (op.fixed || op.isFixed || op.position === "fixed" || op.position === "FIXED") {
      if ("layoutPositioning" in node) {
        node.layoutPositioning = "ABSOLUTE";
      }
    }
  }
  function parseTrigger(rawTrigger) {
    const t = String(rawTrigger || "ON_CLICK").toUpperCase().trim();
    if (t.includes("HOVER")) return { type: "HOVER" };
    if (t.includes("PRESS")) return { type: "PRESS" };
    if (t.includes("DRAG")) return { type: "DRAG" };
    if (t.includes("ENTER")) return { type: "MOUSE_ENTER" };
    if (t.includes("LEAVE")) return { type: "MOUSE_LEAVE" };
    if (t.includes("DELAY") || t.includes("TIMEOUT")) return { type: "AFTER_TIMEOUT", timeout: 0.8 };
    return { type: "ON_CLICK" };
  }
  function parseTransition(rawTrans) {
    const trans = String(rawTrans || "SMART_ANIMATE").toUpperCase().trim();
    if (trans.includes("DISSOLVE")) {
      return { type: "DISSOLVE", easing: { type: "EASE_OUT" }, duration: 0.25 };
    }
    if (trans.includes("INSTANT")) {
      return { type: "INSTANT" };
    }
    if (trans.includes("SLIDE")) {
      return { type: "SLIDE_IN", direction: "LEFT", easing: { type: "EASE_OUT" }, duration: 0.3 };
    }
    return { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.3 };
  }
  function resolveDestinationNode(targetRef, nodeLookup) {
    if (!targetRef) return null;
    if (typeof targetRef === "object" && targetRef.id) return targetRef;
    const query = String(targetRef).toLowerCase().trim();
    if (nodeLookup) {
      for (const [key, n] of nodeLookup.entries()) {
        if (key.toLowerCase() === query || n.name && n.name.toLowerCase() === query) {
          return n;
        }
      }
    }
    const canvasMatch = figma.currentPage.findOne((n) => n.id === targetRef || n.name.toLowerCase() === query);
    return canvasMatch || null;
  }
  function applyNodeInteraction(sourceNode, interaction, nodeLookup) {
    if (!sourceNode || !interaction || !("setReactions" in sourceNode)) return;
    try {
      const trigger = parseTrigger(interaction.trigger);
      const actType = String(interaction.action || interaction.navigation || "NAVIGATE").toUpperCase().trim();
      if (actType === "BACK") {
        sourceNode.setReactions([{ trigger, actions: [{ type: "BACK" }] }]);
        return;
      }
      if (actType === "CLOSE") {
        sourceNode.setReactions([{ trigger, actions: [{ type: "CLOSE" }] }]);
        return;
      }
      if (actType === "URL" && interaction.url) {
        sourceNode.setReactions([{ trigger, actions: [{ type: "URL", url: interaction.url }] }]);
        return;
      }
      const dest = resolveDestinationNode(interaction.destination || interaction.destinationId || interaction.target, nodeLookup);
      if (!dest) {
        console.warn("[Figma AI Copilot] Destino de interacci\xF3n no encontrado:", interaction.destination);
        return;
      }
      const transition = parseTransition(interaction.transition);
      const nav = actType.includes("OVERLAY") ? "OVERLAY" : actType.includes("CHANGE") ? "CHANGE_TO" : "NAVIGATE";
      sourceNode.setReactions([{
        trigger,
        actions: [{
          type: "NODE",
          destinationId: dest.id,
          navigation: nav,
          transition
        }]
      }]);
    } catch (err) {
      console.warn("[Figma AI Copilot] Error aplicando interacci\xF3n:", err);
    }
  }
  var init_prototype = __esm({
    "src/plugin/operations/prototype.js"() {
    }
  });

  // src/plugin/operations/layout.js
  function registerChildExecutor(executor) {
    childExecutor = executor;
  }
  function opCreateFrame(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const frame = figma.createFrame();
      const preset = resolveDevicePreset(op);
      const width = Math.max(1, op.width || (preset == null ? void 0 : preset.width) || 320);
      const height = Math.max(1, op.height || (preset == null ? void 0 : preset.height) || 200);
      frame.name = op.name || (preset == null ? void 0 : preset.name) || "Frame";
      frame.resize(width, height);
      if (op.cornerRadius != null) frame.cornerRadius = Number(op.cornerRadius);
      if (op.fills !== void 0) frame.fills = parseFills(op.fills);
      applyStrokesAndEffects(frame, op);
      applyScrollBehavior(frame, op);
      const mode = String(op.layoutMode || "").toUpperCase();
      if (mode === "HORIZONTAL" || mode === "VERTICAL") {
        frame.layoutMode = mode;
        if (op.itemSpacing != null) frame.itemSpacing = Number(op.itemSpacing);
        const pad = op.padding;
        const defaultPad = typeof pad === "number" ? pad : 0;
        frame.paddingTop = (_b = (_a = op.paddingTop) != null ? _a : pad == null ? void 0 : pad.top) != null ? _b : defaultPad;
        frame.paddingRight = (_d = (_c = op.paddingRight) != null ? _c : pad == null ? void 0 : pad.right) != null ? _d : defaultPad;
        frame.paddingBottom = (_f = (_e = op.paddingBottom) != null ? _e : pad == null ? void 0 : pad.bottom) != null ? _f : defaultPad;
        frame.paddingLeft = (_h = (_g = op.paddingLeft) != null ? _g : pad == null ? void 0 : pad.left) != null ? _h : defaultPad;
        if (op.primaryAxisAlignItems) frame.primaryAxisAlignItems = op.primaryAxisAlignItems.toUpperCase();
        if (op.counterAxisAlignItems) frame.counterAxisAlignItems = op.counterAxisAlignItems.toUpperCase();
        if (op.layoutWrap === "WRAP" || op.wrap) {
          try {
            frame.layoutWrap = "WRAP";
          } catch (e) {
          }
        }
      } else {
        frame.layoutMode = "NONE";
      }
      if (op.clipsContent != null) frame.clipsContent = Boolean(op.clipsContent);
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(frame);
      if (op.x != null && op.y != null) {
        frame.x = Number(op.x);
        frame.y = Number(op.y);
      } else if (!parent) {
        const center = figma.viewport.center;
        frame.x = Math.round(center.x - frame.width / 2);
        frame.y = Math.round(center.y - frame.height / 2);
      }
      if (Array.isArray(op.children) && op.children.length > 0 && childExecutor) {
        for (const childOp of op.children) {
          yield childExecutor(childOp, frame);
        }
      }
      return frame;
    });
  }
  function opApplyAutoLayout(op) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      let frame;
      const target = op.nodeId ? figma.getNodeById(op.nodeId) : figma.currentPage.selection[0];
      if (target && target.type === "FRAME") {
        frame = target;
      } else {
        const selection = op.nodeId ? [figma.getNodeById(op.nodeId)].filter(Boolean) : [...figma.currentPage.selection];
        if (selection.length === 0) throw new Error("No hay capas seleccionadas para aplicar Auto-Layout.");
        frame = figma.createFrame();
        frame.name = op.name || "AutoLayout Frame";
        const first = selection[0];
        const parent = first.parent || figma.currentPage;
        parent.appendChild(frame);
        frame.x = first.x;
        frame.y = first.y;
        frame.fills = op.fills ? parseFills(op.fills) : [];
        for (const item of selection) {
          frame.appendChild(item);
        }
      }
      const dir = String(op.direction || op.layoutMode || "VERTICAL").toUpperCase();
      frame.layoutMode = dir === "HORIZONTAL" ? "HORIZONTAL" : "VERTICAL";
      if (op.itemSpacing != null) frame.itemSpacing = Number(op.itemSpacing);
      const pad = op.padding;
      const defaultPad = typeof pad === "number" ? pad : 0;
      frame.paddingTop = (_b = (_a = op.paddingTop) != null ? _a : pad == null ? void 0 : pad.top) != null ? _b : defaultPad;
      frame.paddingRight = (_d = (_c = op.paddingRight) != null ? _c : pad == null ? void 0 : pad.right) != null ? _d : defaultPad;
      frame.paddingBottom = (_f = (_e = op.paddingBottom) != null ? _e : pad == null ? void 0 : pad.bottom) != null ? _f : defaultPad;
      frame.paddingLeft = (_h = (_g = op.paddingLeft) != null ? _g : pad == null ? void 0 : pad.left) != null ? _h : defaultPad;
      if (op.primaryAxisAlignItems) frame.primaryAxisAlignItems = op.primaryAxisAlignItems.toUpperCase();
      if (op.counterAxisAlignItems) frame.counterAxisAlignItems = op.counterAxisAlignItems.toUpperCase();
      if (op.layoutWrap === "WRAP" || op.wrap) {
        try {
          frame.layoutWrap = "WRAP";
        } catch (e) {
        }
      }
      return frame;
    });
  }
  var childExecutor;
  var init_layout = __esm({
    "src/plugin/operations/layout.js"() {
      init_helpers();
      init_presets();
      init_prototype();
      childExecutor = null;
    }
  });

  // src/plugin/icons.js
  var BOOTSTRAP_ICONS;
  var init_icons = __esm({
    "src/plugin/icons.js"() {
      BOOTSTRAP_ICONS = {
        // Navegación y UI General
        "house": '<path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>',
        "search": '<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>',
        "bell": '<path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>',
        "person": '<path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>',
        "gear": '<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>',
        // Seguridad, Rutas y Ubicación
        "shield-check": '<path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.55 3.998-.08 7.904 1.745 11.238a.5.5 0 0 0 .428.286c.64.07 1.28.114 1.92.133a46 46 0 0 0 1.918-.133.5.5 0 0 0 .428-.286c1.824-3.334 2.294-7.24 1.745-11.238a.48.48 0 0 0-.328-.39c-.933-.284-1.88-.57-2.837-.856a.5.5 0 0 0-.286 0zm5.523 5.48a.5.5 0 0 1 .123.593l-2.5 4.5a.5.5 0 0 1-.803.111l-1.5-1.5a.5.5 0 1 1 .707-.707l1.096 1.096 2.17-3.906a.5.5 0 0 1 .707-.187"/>',
        "geo-alt": '<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4"/>',
        "telephone": '<path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58z"/>',
        "exclamation-triangle": '<path d="M7.938 2.016a.13.13 0 0 1 .125 0l6.857 11.656c.028.05.028.11 0 .16s-.08.08-.125.08H1.205c-.045 0-.097-.03-.125-.08s-.028-.11 0-.16zM8 0c-.27 0-.527.14-.656.36L.487 12.016C.358 12.236.358 12.51.487 12.73s.386.36.656.36h13.714c.27 0 .527-.14.656-.36s.129-.494 0-.714L8.656.36A.75.75 0 0 0 8 0M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.55.55 0 0 1-1.1 0z"/>',
        "heart": '<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>',
        // Flechas y Acciones Comunes
        "arrow-left": '<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>',
        "arrow-right": '<path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>',
        "plus": '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>',
        "check-circle": '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>',
        "lock": '<path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>',
        "envelope": '<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>',
        // Valoraciones, Código y Visualización
        "star": '<path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.895a.5.5 0 0 0-.461 0z"/>',
        "star-fill": '<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.174 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>',
        "code-slash": '<path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0"/>',
        "eye": '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>',
        // Comercio y Git
        "bag": '<path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>',
        "cart": '<path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>',
        "git": '<path d="M15.627 7.284 9.097.75a1.07 1.07 0 0 0-1.514 0L6.26 2.07l1.91 1.91a1.2 1.2 0 0 1 .442-.083c.666 0 1.206.54 1.206 1.206 0 .236-.068.456-.185.642l1.843 1.843a1.2 1.2 0 0 1 .642-.185c.666 0 1.206.54 1.206 1.206 0 .665-.54 1.206-1.206 1.206s-1.206-.54-1.206-1.206c0-.236.068-.456.185-.642L9.14 6.118a1.2 1.2 0 0 1-.416.077c-.666 0-1.206-.54-1.206-1.206 0-.236.068-.456.185-.642L5.79 2.505.75 7.545a1.07 1.07 0 0 0 0 1.514l6.53 6.534a1.07 1.07 0 0 0 1.514 0l6.833-6.833a1.07 1.07 0 0 0 0-1.514l-.001.038z"/>'
      };
    }
  });

  // src/plugin/operations/primitives.js
  function opCreateRectangle(op, parent) {
    return __async(this, null, function* () {
      const rect = figma.createRectangle();
      rect.name = op.name || "Rectangle";
      rect.resize(Math.max(1, op.width || 120), Math.max(1, op.height || 80));
      if (op.cornerRadius != null) rect.cornerRadius = Number(op.cornerRadius);
      if (op.fills !== void 0) rect.fills = parseFills(op.fills);
      applyStrokesAndEffects(rect, op);
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(rect);
      if (op.x != null) rect.x = Number(op.x);
      if (op.y != null) rect.y = Number(op.y);
      return rect;
    });
  }
  function opCreateEllipse(op, parent) {
    return __async(this, null, function* () {
      const ellipse = figma.createEllipse();
      ellipse.name = op.name || "Ellipse";
      ellipse.resize(Math.max(1, op.width || 80), Math.max(1, op.height || 80));
      if (op.fills !== void 0) ellipse.fills = parseFills(op.fills);
      applyStrokesAndEffects(ellipse, op);
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(ellipse);
      if (op.x != null) ellipse.x = Number(op.x);
      if (op.y != null) ellipse.y = Number(op.y);
      return ellipse;
    });
  }
  function opCreateText(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      const text = figma.createText();
      text.name = op.name || "Text";
      const font = yield ensureFontLoaded(op.fontFamily || op.family, op.fontStyle || op.style);
      text.fontName = font;
      text.characters = String((_b = (_a = op.characters) != null ? _a : op.text) != null ? _b : "Texto");
      if (op.fontSize != null) text.fontSize = Number(op.fontSize);
      if (op.fontColor != null || op.fills != null) text.fills = parseFills((_c = op.fontColor) != null ? _c : op.fills);
      if (op.textAlign) {
        const align = String(op.textAlign).toUpperCase();
        if (["LEFT", "CENTER", "RIGHT", "JUSTIFIED"].includes(align)) {
          text.textAlignHorizontal = align;
        }
      }
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(text);
      if (op.x != null) text.x = Number(op.x);
      if (op.y != null) text.y = Number(op.y);
      return text;
    });
  }
  function opCreateIcon(op, parent) {
    return __async(this, null, function* () {
      const iconName = (op.icon || op.name || "house").toLowerCase();
      const colorHex = op.color || op.fill || "#005F73";
      const size = Math.max(8, Number(op.size || 24));
      const svgPath = BOOTSTRAP_ICONS[iconName] || BOOTSTRAP_ICONS["shield-check"] || BOOTSTRAP_ICONS["house"];
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${colorHex}" viewBox="0 0 16 16">${svgPath}</svg>`;
      const iconNode = figma.createNodeFromSvg(svgContent);
      iconNode.name = `Icon/${iconName}`;
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(iconNode);
      if (op.x != null && op.y != null) {
        iconNode.x = Number(op.x);
        iconNode.y = Number(op.y);
      }
      return iconNode;
    });
  }
  var init_primitives = __esm({
    "src/plugin/operations/primitives.js"() {
      init_helpers();
      init_icons();
    }
  });

  // src/plugin/operations/components.js
  function opCreateButton(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const button = figma.createFrame();
      button.name = op.name || "Button";
      button.layoutMode = "HORIZONTAL";
      button.primaryAxisAlignItems = "CENTER";
      button.counterAxisAlignItems = "CENTER";
      button.primaryAxisSizingMode = op.width ? "FIXED" : "AUTO";
      button.counterAxisSizingMode = op.height ? "FIXED" : "AUTO";
      if (op.width) button.resize(Math.max(1, op.width), button.height);
      if (op.height) button.resize(button.width, Math.max(1, op.height));
      const padH = Number((_b = (_a = op.paddingX) != null ? _a : op.paddingHorizontal) != null ? _b : 16);
      const padV = Number((_d = (_c = op.paddingY) != null ? _c : op.paddingVertical) != null ? _d : 10);
      button.paddingLeft = padH;
      button.paddingRight = padH;
      button.paddingTop = padV;
      button.paddingBottom = padV;
      button.itemSpacing = Number((_e = op.itemSpacing) != null ? _e : 8);
      button.cornerRadius = Number((_f = op.cornerRadius) != null ? _f : 8);
      const variant = String(op.variant || "PRIMARY").toUpperCase();
      if (op.fills !== void 0) {
        button.fills = parseFills(op.fills);
      } else if (variant === "SECONDARY") {
        button.fills = parseFills("#21262D");
      } else if (variant === "OUTLINE") {
        button.fills = [];
      } else if (variant === "GITHUB") {
        button.fills = parseFills("#238636");
      } else {
        button.fills = parseFills(op.backgroundColor || "#6366F1");
      }
      applyStrokesAndEffects(button, op);
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(button);
      if (op.icon) {
        yield opCreateIcon({
          icon: op.icon,
          size: Number(op.iconSize || 16),
          color: op.iconColor || (variant === "OUTLINE" ? "#6366F1" : "#FFFFFF")
        }, button);
      }
      const text = figma.createText();
      text.name = "Label";
      text.fontName = yield ensureFontLoaded(op.fontFamily || "Inter", op.fontWeight === "BOLD" ? "Bold" : "Medium");
      text.characters = String((_i = (_h = (_g = op.label) != null ? _g : op.text) != null ? _h : op.title) != null ? _i : "Button");
      text.fontSize = Number((_j = op.fontSize) != null ? _j : 14);
      text.fills = parseFills(op.textColor || (variant === "OUTLINE" ? "#6366F1" : "#FFFFFF"));
      button.appendChild(text);
      if (op.x != null && op.y != null) {
        button.x = Number(op.x);
        button.y = Number(op.y);
      }
      return button;
    });
  }
  function opCreateBadge(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const badge = figma.createFrame();
      badge.name = op.name || "Badge";
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisAlignItems = "CENTER";
      badge.counterAxisAlignItems = "CENTER";
      badge.primaryAxisSizingMode = "AUTO";
      badge.counterAxisSizingMode = "AUTO";
      badge.paddingLeft = 8;
      badge.paddingRight = 8;
      badge.paddingTop = 3;
      badge.paddingBottom = 3;
      badge.cornerRadius = Number((_a = op.cornerRadius) != null ? _a : 999);
      badge.fills = parseFills(op.fills || op.backgroundColor || "rgba(99, 102, 241, 0.15)");
      applyStrokesAndEffects(badge, op);
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(badge);
      const text = figma.createText();
      text.name = "BadgeText";
      text.fontName = yield ensureFontLoaded(op.fontFamily || "Inter", "Medium");
      text.characters = String((_c = (_b = op.text) != null ? _b : op.label) != null ? _c : "Badge");
      text.fontSize = Number((_d = op.fontSize) != null ? _d : 11);
      text.fills = parseFills(op.textColor || "#A5B4FC");
      badge.appendChild(text);
      return badge;
    });
  }
  function opCreateInput(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const input = figma.createFrame();
      input.name = op.name || "InputField";
      input.layoutMode = "HORIZONTAL";
      input.primaryAxisAlignItems = "MIN";
      input.counterAxisAlignItems = "CENTER";
      input.resize(Math.max(1, op.width || 280), Math.max(1, op.height || 42));
      input.paddingLeft = 12;
      input.paddingRight = 12;
      input.cornerRadius = Number((_a = op.cornerRadius) != null ? _a : 6);
      input.fills = parseFills(op.fills || op.backgroundColor || "#0D1117");
      if (!op.strokes && !op.borderColor) {
        input.strokes = parseFills("#30363D");
        input.strokeWeight = 1;
      } else {
        applyStrokesAndEffects(input, op);
      }
      const targetParent = parent || figma.currentPage;
      targetParent.appendChild(input);
      const text = figma.createText();
      text.name = "Placeholder";
      text.fontName = yield ensureFontLoaded(op.fontFamily || "Inter", "Regular");
      text.characters = String((_c = (_b = op.placeholder) != null ? _b : op.text) != null ? _c : "Introduce un valor...");
      text.fontSize = Number((_d = op.fontSize) != null ? _d : 13);
      text.fills = parseFills("#8B949E");
      input.appendChild(text);
      return input;
    });
  }
  function createVariantState(name, color, label, font, op, radius, padX, padY) {
    var _a;
    const comp = figma.createComponent();
    comp.name = name;
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisAlignItems = "CENTER";
    comp.counterAxisAlignItems = "CENTER";
    comp.primaryAxisSizingMode = "AUTO";
    comp.counterAxisSizingMode = "AUTO";
    comp.paddingLeft = padX;
    comp.paddingRight = padX;
    comp.paddingTop = padY;
    comp.paddingBottom = padY;
    comp.cornerRadius = radius;
    comp.fills = parseFills(color);
    applyStrokesAndEffects(comp, op);
    const text = figma.createText();
    text.name = "Label";
    text.fontName = font;
    text.characters = label;
    text.fontSize = Number((_a = op.fontSize) != null ? _a : 14);
    text.fills = parseFills(op.textColor || "#FFFFFF");
    comp.appendChild(text);
    return comp;
  }
  function opCreateInteractiveComponentSet(op, parent) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      const padX = Number((_a = op.paddingX) != null ? _a : 18);
      const padY = Number((_b = op.paddingY) != null ? _b : 10);
      const radius = Number((_c = op.cornerRadius) != null ? _c : 8);
      const font = yield ensureFontLoaded(op.fontFamily || "Inter", "Bold");
      const label = String((_e = (_d = op.label) != null ? _d : op.text) != null ? _e : "Bot\xF3n Interactivo");
      const compDefault = createVariantState("State=Default", op.baseColor || op.backgroundColor || "#005F73", label, font, op, radius, padX, padY);
      const compHover = createVariantState("State=Hover", op.hoverColor || "#0A9396", label, font, op, radius, padX, padY);
      const isInsideFrame = Boolean(parent && (parent.type === "FRAME" || parent.type === "COMPONENT" || parent.type === "COMPONENT_SET" || parent.type === "GROUP"));
      const setParent = isInsideFrame ? figma.currentPage : parent || figma.currentPage;
      setParent.appendChild(compDefault);
      setParent.appendChild(compHover);
      const componentSet = figma.combineAsVariants([compDefault, compHover], setParent);
      componentSet.name = op.name || "Interactive Button";
      try {
        compDefault.setReactions([{
          trigger: { type: "WHILE_HOVERING" },
          actions: [{
            type: "NODE",
            destinationId: compHover.id,
            navigation: "CHANGE_TO",
            transition: { type: "SMART_ANIMATE", easing: { type: "EASE_OUT" }, duration: 0.2 }
          }]
        }]);
      } catch (err) {
        console.warn("[Figma AI Copilot] Error configurando reacci\xF3n inteligente:", err);
      }
      if (isInsideFrame) {
        const instance = compDefault.createInstance();
        instance.name = op.name || "Interactive Button";
        parent.appendChild(instance);
        return instance;
      }
      return componentSet;
    });
  }
  var init_components = __esm({
    "src/plugin/operations/components.js"() {
      init_helpers();
      init_primitives();
    }
  });

  // src/plugin/operations/selection.js
  function opAlignSelection(op) {
    return __async(this, null, function* () {
      var _a;
      const nodes = op.nodeIds ? op.nodeIds.map((id) => figma.getNodeById(id)).filter(Boolean) : [...figma.currentPage.selection];
      if (nodes.length < 2) {
        throw new Error("Se requieren al menos 2 elementos seleccionados para alinear.");
      }
      const direction = String(op.direction || "ROW").toUpperCase();
      const spacing = Number((_a = op.spacing) != null ? _a : 16);
      if (direction === "ROW" || direction === "HORIZONTAL") {
        nodes.sort((a, b) => a.x - b.x);
        let curX = nodes[0].x;
        const baseVal = nodes[0].y;
        for (const node of nodes) {
          node.x = curX;
          if (op.alignCross === "CENTER") {
            node.y = baseVal + (nodes[0].height - node.height) / 2;
          }
          curX += node.width + spacing;
        }
      } else if (direction === "COLUMN" || direction === "VERTICAL") {
        nodes.sort((a, b) => a.y - b.y);
        let curY = nodes[0].y;
        const baseVal = nodes[0].x;
        for (const node of nodes) {
          node.y = curY;
          if (op.alignCross === "CENTER") {
            node.x = baseVal + (nodes[0].width - node.width) / 2;
          }
          curY += node.height + spacing;
        }
      } else if (direction === "GRID") {
        const cols = Math.max(1, Number(op.cols || 2));
        const startX = nodes[0].x;
        const startY = nodes[0].y;
        const colWidth = Math.max(...nodes.map((n) => n.width));
        const rowHeight = Math.max(...nodes.map((n) => n.height));
        nodes.forEach((node, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          node.x = startX + col * (colWidth + spacing);
          node.y = startY + row * (rowHeight + spacing);
        });
      }
      return nodes[0];
    });
  }
  function opRenameNodes(op) {
    return __async(this, null, function* () {
      const nodes = op.nodeIds ? op.nodeIds.map((id) => figma.getNodeById(id)).filter(Boolean) : [...figma.currentPage.selection];
      if (nodes.length === 0) {
        throw new Error("No hay capas seleccionadas para renombrar.");
      }
      const pattern = String(op.newName || op.name || "Layer");
      nodes.forEach((node, idx) => {
        node.name = pattern.replace("{i}", String(idx + 1)).replace("{n}", String(node.name));
      });
      return nodes[0];
    });
  }
  function opEditNode(op) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      const target = op.nodeId ? figma.getNodeById(op.nodeId) : figma.currentPage.selection[0];
      if (!target) {
        throw new Error(`Nodo no encontrado para EDIT_NODE: ${op.nodeId || "selecci\xF3n vac\xEDa"}`);
      }
      if (op.name) target.name = op.name;
      if (op.width != null || op.height != null) {
        const w = (_a = op.width) != null ? _a : target.width;
        const h = (_b = op.height) != null ? _b : target.height;
        if ("resize" in target) target.resize(w, h);
      }
      if (op.cornerRadius != null && "cornerRadius" in target) {
        target.cornerRadius = Number(op.cornerRadius);
      }
      if (op.fills !== void 0 && "fills" in target) {
        target.fills = parseFills(op.fills);
      }
      if ((op.characters != null || op.text != null) && target.type === "TEXT") {
        if (typeof target.fontName === "symbol") {
          yield ensureFontLoaded("Inter", "Regular");
          target.fontName = { family: "Inter", style: "Regular" };
        } else {
          yield figma.loadFontAsync(target.fontName);
        }
        target.characters = String((_c = op.characters) != null ? _c : op.text);
      }
      if (op.fontSize != null && target.type === "TEXT") {
        target.fontSize = Number(op.fontSize);
      }
      if (op.opacity != null && "opacity" in target) {
        target.opacity = Math.max(0, Math.min(1, Number(op.opacity)));
      }
      if (op.visible != null && "visible" in target) {
        target.visible = Boolean(op.visible);
      }
      return target;
    });
  }
  var init_selection = __esm({
    "src/plugin/operations/selection.js"() {
      init_helpers();
    }
  });

  // src/plugin/dispatcher.js
  function executeSingleOperation(rawOp, parent = null) {
    return __async(this, null, function* () {
      const op = normalizeOperation(rawOp);
      const action = op.action;
      let node = null;
      switch (action) {
        case "CREATE_FRAME":
          node = yield opCreateFrame(op, parent);
          break;
        case "CREATE_BUTTON":
          node = yield opCreateButton(op, parent);
          break;
        case "CREATE_ICON":
          node = yield opCreateIcon(op, parent);
          break;
        case "CREATE_COMPONENT_SET":
        case "CREATE_INTERACTIVE_BUTTON":
          node = yield opCreateInteractiveComponentSet(op, parent);
          break;
        case "CREATE_BADGE":
          node = yield opCreateBadge(op, parent);
          break;
        case "CREATE_INPUT":
          node = yield opCreateInput(op, parent);
          break;
        case "CREATE_TEXT":
          node = yield opCreateText(op, parent);
          break;
        case "CREATE_RECTANGLE":
          node = yield opCreateRectangle(op, parent);
          break;
        case "CREATE_ELLIPSE":
          node = yield opCreateEllipse(op, parent);
          break;
        case "EDIT_NODE":
        case "MODIFY_NODE":
          node = yield opEditNode(op);
          break;
        case "APPLY_AUTOLAYOUT":
        case "SET_AUTO_LAYOUT":
          node = yield opApplyAutoLayout(op);
          break;
        case "ALIGN_SELECTION":
          node = yield opAlignSelection(op);
          break;
        case "RENAME_NODES":
          node = yield opRenameNodes(op);
          break;
        case "CREATE_INTERACTION":
          pendingInteractions.push({ source: op.source || op.from, interaction: op });
          return null;
        default:
          node = yield opCreateFrame(op, parent);
          break;
      }
      if (node && "id" in node) {
        if (op.name) activeNodeLookup.set(op.name, node);
        if (op.id) activeNodeLookup.set(op.id, node);
        activeNodeLookup.set(node.id, node);
        if (op.interaction) {
          pendingInteractions.push({ source: node, interaction: op.interaction });
        }
      }
      return node;
    });
  }
  function executeDsl(payload) {
    return __async(this, null, function* () {
      const operations = Array.isArray(payload) ? payload : Array.isArray(payload == null ? void 0 : payload.operations) ? payload.operations : [payload];
      activeNodeLookup.clear();
      pendingInteractions = [];
      const affectedNodes = [];
      for (const op of operations) {
        if (!op || typeof op !== "object") continue;
        const node = yield executeSingleOperation(op);
        if (node && "id" in node) {
          affectedNodes.push(node);
        }
      }
      for (const item of pendingInteractions) {
        let src = item.source;
        if (typeof src === "string") {
          src = activeNodeLookup.get(src) || figma.currentPage.findOne((n) => n.name === src || n.id === src);
        }
        if (src) {
          applyNodeInteraction(src, item.interaction, activeNodeLookup);
        }
      }
      if (affectedNodes.length > 0) {
        figma.currentPage.selection = affectedNodes;
        figma.viewport.scrollAndZoomIntoView(affectedNodes);
      }
      return affectedNodes;
    });
  }
  var activeNodeLookup, pendingInteractions;
  var init_dispatcher = __esm({
    "src/plugin/dispatcher.js"() {
      init_helpers();
      init_layout();
      init_components();
      init_primitives();
      init_selection();
      init_prototype();
      activeNodeLookup = /* @__PURE__ */ new Map();
      pendingInteractions = [];
      registerChildExecutor(executeSingleOperation);
    }
  });

  // src/plugin/main.js
  var require_main = __commonJS({
    "src/plugin/main.js"(exports) {
      init_helpers();
      init_dispatcher();
      figma.showUI(__html__, {
        width: 440,
        height: 680,
        themeColors: true
      });
      function broadcastSelection() {
        const selection = figma.currentPage.selection.map(serializeNode).filter(Boolean);
        figma.ui.postMessage({
          type: "SELECTION_CHANGE",
          selection,
          count: selection.length
        });
      }
      figma.on("selectionchange", () => {
        broadcastSelection();
      });
      figma.ui.onmessage = (msg) => __async(null, null, function* () {
        if (!msg || typeof msg !== "object") return;
        try {
          switch (msg.type) {
            case "EXECUTE_DSL": {
              const payload = msg.payload || msg.operations || msg.data;
              const resultNodes = yield executeDsl(payload);
              const serialized = resultNodes.map(serializeNode).filter(Boolean);
              figma.ui.postMessage({
                type: "DSL_RESULT",
                status: "success",
                message: `Ejecuci\xF3n DSL exitosa (${resultNodes.length} nodos procesados)`,
                nodes: serialized,
                count: resultNodes.length
              });
              figma.ui.postMessage({
                type: "EXECUTION_SUCCESS",
                count: resultNodes.length,
                message: `Ejecuci\xF3n DSL exitosa (${resultNodes.length} nodos procesados)`
              });
              figma.notify("\u2728 Dise\xF1o generado con \xE9xito");
              break;
            }
            case "GET_SELECTION": {
              broadcastSelection();
              break;
            }
            case "EXPORT_SELECTION_IMAGE": {
              const selection = figma.currentPage.selection;
              if (!selection || selection.length === 0) {
                figma.ui.postMessage({
                  type: "SELECTION_IMAGE_ERROR",
                  error: "No hay ninguna capa seleccionada en Figma para exportar como imagen."
                });
                figma.notify("\u26A0\uFE0F Por favor selecciona una capa primero", { error: true });
                break;
              }
              const targetNode = selection[0];
              try {
                const maxDim = Math.max(targetNode.width, targetNode.height);
                const scaleVal = Math.min(2, Math.max(0.5, 800 / (maxDim || 1)));
                const bytes = yield targetNode.exportAsync({
                  format: "PNG",
                  constraint: { type: "SCALE", value: scaleVal }
                });
                const base64 = figma.base64Encode ? figma.base64Encode(bytes) : null;
                figma.ui.postMessage({
                  type: "SELECTION_IMAGE_DATA",
                  base64,
                  bytes: base64 ? null : Array.from(bytes),
                  mimeType: "image/png",
                  nodeName: targetNode.name,
                  width: targetNode.width,
                  height: targetNode.height
                });
                figma.notify("\u{1F4F8} Imagen capturada para an\xE1lisis");
              } catch (err) {
                figma.ui.postMessage({
                  type: "SELECTION_IMAGE_ERROR",
                  error: `Error exportando imagen de la capa: ${err.message}`
                });
              }
              break;
            }
            case "STORAGE_GET": {
              const value = yield figma.clientStorage.getAsync(msg.key);
              figma.ui.postMessage({
                type: "STORAGE_GET_RESULT",
                key: msg.key,
                value
              });
              break;
            }
            case "STORAGE_SET": {
              yield figma.clientStorage.setAsync(msg.key, msg.value);
              figma.ui.postMessage({
                type: "STORAGE_SET_RESULT",
                key: msg.key,
                success: true
              });
              break;
            }
            case "NOTIFY": {
              figma.notify(msg.message || "", {
                timeout: msg.timeout || 3e3,
                error: Boolean(msg.error)
              });
              break;
            }
            case "CLOSE": {
              figma.closePlugin();
              break;
            }
            default:
              if (msg.action) {
                const resultNodes = yield executeDsl([msg]);
                figma.ui.postMessage({
                  type: "DSL_RESULT",
                  status: "success",
                  nodes: resultNodes.map(serializeNode).filter(Boolean)
                });
              }
          }
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          console.error("[Figma AI Copilot] Error en ejecuci\xF3n:", error);
          figma.ui.postMessage({
            type: "DSL_RESULT",
            status: "error",
            message: errMessage,
            error: errMessage
          });
          figma.ui.postMessage({
            type: "EXECUTION_ERROR",
            error: errMessage
          });
          figma.notify(`\u274C Error: ${errMessage}`, { error: true });
        }
      });
      broadcastSelection();
      figma.ui.postMessage({
        type: "INIT_STATE",
        selection: figma.currentPage.selection.map(serializeNode).filter(Boolean)
      });
    }
  });
  require_main();
})();
