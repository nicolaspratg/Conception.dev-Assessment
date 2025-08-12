const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
const ctx = canvas ? canvas.getContext('2d')! : null;

// font like "600 14px Inter, ui-sans-serif, system-ui"
export function setFont(font: string) {
  if (ctx && font) ctx.font = font;
}

export function measureTextWidth(text: string): number {
  if (!ctx) return text.length * 8; // fallback
  return ctx.measureText(text).width;
}

export function wrapLabel(
  label: string,
  maxWidth: number,
  font: string,
  lineHeight = 18 // px
): { lines: string[]; width: number; height: number; lineHeight: number } {
  setFont(font);
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  const push = (line: string) => {
    if (!line) return;
    lines.push(line);
  };

  for (const w of words) {
    const next = current ? current + ' ' + w : w;
    if (measureTextWidth(next) <= maxWidth) {
      current = next;
    } else {
      if (!current) {
        // single long word: hard-split
        let chunk = '';
        for (const ch of w) {
          const test = chunk + ch;
          if (measureTextWidth(test) <= maxWidth) chunk = test;
          else { push(chunk); chunk = ch; }
        }
        current = chunk;
      } else {
        push(current);
        current = w;
      }
    }
  }
  push(current);

  const actualWidth = Math.min(
    maxWidth,
    Math.max(...lines.map((l) => measureTextWidth(l)), 0)
  );
  const height = Math.max(lines.length, 1) * lineHeight;

  return { lines, width: actualWidth, height, lineHeight };
}
