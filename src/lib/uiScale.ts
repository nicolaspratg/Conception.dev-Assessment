export function uiScale() {
  if (typeof window === 'undefined') return 1;
  const fs = getComputedStyle(document.documentElement).fontSize;
  const px = parseFloat(fs || '16') || 16;
  return px / 16; // 1.25 when root font-size = 20px
}
