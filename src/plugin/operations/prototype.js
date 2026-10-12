/**
 * Figma AI Copilot - Motor de Prototipado, Interacciones y Scroll Behavior
 * Autor: Brayan Stid Cortés Lombana (bscl)
 */

export function applyScrollBehavior(node, op) {
  if (!node || !('overflowDirection' in node)) return;

  const rawOverflow = String(op.overflow || op.overflowDirection || op.scrollOverflow || '').toUpperCase().trim();
  if (rawOverflow.includes('HORIZ')) {
    node.overflowDirection = 'HORIZONTAL_SCROLLING';
  } else if (rawOverflow.includes('VERT')) {
    node.overflowDirection = 'VERTICAL_SCROLLING';
  } else if (rawOverflow.includes('BOTH')) {
    node.overflowDirection = 'BOTH_SCROLLING';
  } else if (rawOverflow.includes('NONE') || rawOverflow.includes('NO')) {
    node.overflowDirection = 'NONE';
  }

  if (op.fixed || op.isFixed || op.position === 'fixed' || op.position === 'FIXED') {
    if ('layoutPositioning' in node) {
      node.layoutPositioning = 'ABSOLUTE';
    }
  }
}

export function parseTrigger(rawTrigger) {
  const t = String(rawTrigger || 'ON_CLICK').toUpperCase().trim();
  if (t.includes('HOVER')) return { type: 'HOVER' };
  if (t.includes('PRESS')) return { type: 'PRESS' };
  if (t.includes('DRAG')) return { type: 'DRAG' };
  if (t.includes('ENTER')) return { type: 'MOUSE_ENTER' };
  if (t.includes('LEAVE')) return { type: 'MOUSE_LEAVE' };
  if (t.includes('DELAY') || t.includes('TIMEOUT')) return { type: 'AFTER_TIMEOUT', timeout: 0.8 };
  return { type: 'ON_CLICK' };
}

export function parseTransition(rawTrans) {
  const trans = String(rawTrans || 'SMART_ANIMATE').toUpperCase().trim();
  if (trans.includes('DISSOLVE')) {
    return { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.25 };
  }
  if (trans.includes('INSTANT')) {
    return { type: 'INSTANT' };
  }
  if (trans.includes('SLIDE')) {
    return { type: 'SLIDE_IN', direction: 'LEFT', easing: { type: 'EASE_OUT' }, duration: 0.3 };
  }
  return { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.3 };
}

export function resolveDestinationNode(targetRef, nodeLookup) {
  if (!targetRef) return null;
  if (typeof targetRef === 'object' && targetRef.id) return targetRef;

  const query = String(targetRef).toLowerCase().trim();
  if (nodeLookup) {
    for (const [key, n] of nodeLookup.entries()) {
      if (key.toLowerCase() === query || (n.name && n.name.toLowerCase() === query)) {
        return n;
      }
    }
  }

  const canvasMatch = figma.currentPage.findOne(n => n.id === targetRef || n.name.toLowerCase() === query);
  return canvasMatch || null;
}

export function applyNodeInteraction(sourceNode, interaction, nodeLookup) {
  if (!sourceNode || !interaction || !('setReactions' in sourceNode)) return;

  try {
    const trigger = parseTrigger(interaction.trigger);
    const actType = String(interaction.action || interaction.navigation || 'NAVIGATE').toUpperCase().trim();

    if (actType === 'BACK') {
      sourceNode.setReactions([{ trigger, actions: [{ type: 'BACK' }] }]);
      return;
    }
    if (actType === 'CLOSE') {
      sourceNode.setReactions([{ trigger, actions: [{ type: 'CLOSE' }] }]);
      return;
    }
    if (actType === 'URL' && interaction.url) {
      sourceNode.setReactions([{ trigger, actions: [{ type: 'URL', url: interaction.url }] }]);
      return;
    }

    const dest = resolveDestinationNode(interaction.destination || interaction.destinationId || interaction.target, nodeLookup);
    if (!dest) {
      console.warn('[Figma AI Copilot] Destino de interacción no encontrado:', interaction.destination);
      return;
    }

    const transition = parseTransition(interaction.transition);
    const nav = actType.includes('OVERLAY') ? 'OVERLAY' : (actType.includes('CHANGE') ? 'CHANGE_TO' : 'NAVIGATE');

    sourceNode.setReactions([{
      trigger,
      actions: [{
        type: 'NODE',
        destinationId: dest.id,
        navigation: nav,
        transition
      }]
    }]);
  } catch (err) {
    console.warn('[Figma AI Copilot] Error aplicando interacción:', err);
  }
}

export async function opCreateInteraction(op, nodeLookup) {
  const source = resolveDestinationNode(op.source || op.sourceNodeId || op.from, nodeLookup);
  if (!source) throw new Error(`Nodo de origen no encontrado para interacción: ${op.source}`);
  applyNodeInteraction(source, op, nodeLookup);
  return source;
}
