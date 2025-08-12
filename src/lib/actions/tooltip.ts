export function tooltip(node: HTMLElement, options: { content: string; position?: 'left' | 'bottom' } | undefined) {
  if (!options) return;

  let tooltip: HTMLElement | null = null;
  let timeout: number;

  function showTooltip() {
    tooltip = document.createElement('div');
    tooltip.textContent = options!.content;
    
    const isBottom = options!.position === 'bottom';
    const transformClass = isBottom ? 'translate-y-2' : 'translate-x-2';
    
    tooltip.className = `absolute z-[70] px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg whitespace-nowrap opacity-0 transform ${transformClass} transition-all duration-200 ease-out`;
    document.body.appendChild(tooltip);

    const rect = node.getBoundingClientRect();
    
    if (options!.position === 'bottom') {
      // Position tooltip at the bottom of the button
      tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
      tooltip.style.top = rect.bottom + 8 + 'px';
    } else {
      // Default: position tooltip to the left of the button
      tooltip.style.left = rect.left - tooltip.offsetWidth - 8 + 'px';
      tooltip.style.top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2 + 'px';
    }

    // Trigger animation after positioning
    requestAnimationFrame(() => {
      if (tooltip) {
        const isBottom = options!.position === 'bottom';
        const fromClass = isBottom ? 'translate-y-2' : 'translate-x-2';
        const toClass = isBottom ? 'translate-y-0' : 'translate-x-0';
        
        tooltip.classList.remove('opacity-0', fromClass);
        tooltip.classList.add('opacity-100', toClass);
      }
    });
  }

  function hideTooltip() {
    if (tooltip) {
      // Animate out
      const isBottom = options!.position === 'bottom';
      const fromClass = isBottom ? 'translate-y-0' : 'translate-x-0';
      const toClass = isBottom ? 'translate-y-2' : 'translate-x-2';
      
      tooltip.classList.remove('opacity-100', fromClass);
      tooltip.classList.add('opacity-0', toClass);
      
      // Remove after animation completes
      setTimeout(() => {
        if (tooltip && tooltip.parentNode) {
          tooltip.remove();
          tooltip = null;
        }
      }, 200);
    }
  }

  function handleMouseEnter() {
    timeout = window.setTimeout(showTooltip, 300); // Reduced delay for better responsiveness
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
