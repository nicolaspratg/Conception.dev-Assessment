// src/lib/diagram/measure.ts
let svg: SVGSVGElement | null = null;
let textEl: SVGTextElement | null = null;

function ensureSVG() {
  if (svg) return;
  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.left = '-9999px';
  svg.style.top = '-9999px';
  document.body.appendChild(svg);

  textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEl.setAttribute('x', '0');
  textEl.setAttribute('y', '0');
  // Keep font in sync with node/label styles
  textEl.setAttribute('font-family', 'ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial');
  textEl.setAttribute('font-size', '14');
  svg.appendChild(textEl);
}

export function measureText(txt: string, fontSize = 14, maxWidth = 320) {
  ensureSVG();
  if (!textEl) return { width: 0, height: 0, lines: 1 };

  textEl.setAttribute('font-size', String(fontSize));

  const words = (txt ?? '').toString().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    textEl.textContent = line ? `${line} ${w}` : w;
    const { width } = (textEl as any).getBBox();
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = textEl.textContent!;
    }
  }
  if (line) lines.push(line);

  let max = 0;
  for (const ln of lines) {
    textEl.textContent = ln;
    const { width } = (textEl as any).getBBox();
    if (width > max) max = width;
  }

  const lineHeight = fontSize * 1.3;
  const totalH = lineHeight * lines.length;

  return { width: Math.ceil(max), height: Math.ceil(totalH), lines: lines.length };
}

export function pillSize(txt: string, fontSize = 12, hp = 10, vp = 4) {
  const { width, height } = measureText(txt, fontSize, 220);
  return { width: width + hp * 2, height: height + vp * 2 };
}
