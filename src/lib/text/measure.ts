const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
const ctx = canvas ? canvas.getContext('2d')! : null;

// Ensure font is loaded before measuring
let fontLoaded = false;
if (typeof window !== 'undefined') {
  // Check if Inter font is loaded
  document.fonts?.ready?.then(() => {
    fontLoaded = true;
  }).catch(() => {
    // Fallback if fonts API is not available
    fontLoaded = true;
  });
}

// font like "600 14px Inter, ui-sans-serif, system-ui"
export function setFont(font: string) {
  if (ctx && font) ctx.font = font;
}

export function measureTextWidth(text: string): number {
  if (!ctx || !fontLoaded) {
    // Better fallback for SSR or when font isn't loaded - estimate based on character count and font size
    // For "600 14px Inter" font, characters are roughly 8.5px wide on average
    // But we need to account for character width variations
    const charWidths: { [key: string]: number } = {
      'i': 4, 'l': 4, 'I': 4, '1': 6, ' ': 4,
      'a': 8, 'c': 7, 'e': 8, 'm': 12, 'n': 8, 'o': 8, 'r': 5, 's': 7, 'u': 8, 'v': 7, 'w': 11, 'x': 7, 'z': 7,
      'A': 10, 'B': 9, 'C': 9, 'D': 10, 'E': 8, 'F': 7, 'G': 10, 'H': 10, 'J': 6, 'K': 9, 'L': 7, 'M': 12, 'N': 10, 'O': 10, 'P': 8, 'Q': 10, 'R': 9, 'S': 8, 'T': 8, 'U': 10, 'V': 9, 'W': 14, 'X': 9, 'Y': 8, 'Z': 8,
      '(': 5, ')': 5, '-': 5, '_': 7, '.': 3, ',': 3, ':': 3, ';': 3
    };
    
    let totalWidth = 0;
    for (const char of text) {
      totalWidth += charWidths[char] || 8.5; // default width for unknown characters
    }
    return totalWidth;
  }
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
