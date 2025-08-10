export function tooltip(node: HTMLElement, options: { content: string } | undefined) {
  if (!options) return;

  let tooltip: HTMLElement;
  let timeout: number;

  function showTooltip() {
    tooltip = document.createElement('div');
    tooltip.textContent = options.content;
    tooltip.className = 'absolute z-[70] px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg whitespace-nowrap';
    document.body.appendChild(tooltip);

    const rect = node.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function handleMouseEnter() {
    timeout = window.setTimeout(showTooltip, 500);
  }

  function handleMouseLeave() {
    clearTimeout(timeout);
    hideTooltip();
  }

  node.addEventListener('mouseenter', handleMouseEnter);
  node.addEventListener('mouseleave', handleMouseLeave);

  return {
    destroy() {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
      hideTooltip();
    }
  };
}
