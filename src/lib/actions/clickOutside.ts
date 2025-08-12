export function clickOutside(
  node: HTMLElement,
  onOutside: () => void
) {
  const handler = (e: PointerEvent) => {
    // if click/tap is outside the node, call the callback
    if (!node.contains(e.target as Node)) onOutside();
  };
  // capture phase so we win over other handlers
  document.addEventListener('pointerdown', handler, true);
  return {
    destroy() {
      document.removeEventListener('pointerdown', handler, true);
    }
  };
}
