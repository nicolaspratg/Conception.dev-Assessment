<script lang="ts">
  import { computeLayout } from './layout';
  import { diagramStore } from './stores/diagramStore';
  import type { Node } from './types/diagram';
  import { onMount } from 'svelte';

  let svgEl: SVGSVGElement;
  let containerWidth = 1000, containerHeight = 600;

  // zoom/pan
  let scale = 1, panX = 0, panY = 0, hasInteracted = false;
  const SCALE_MIN = 0.5, SCALE_MAX = 3;

  // measure prompt bar height for initial safe-fit
  let promptBarHeight = 0;
  function measurePromptBar() {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('prompt-bar');
      promptBarHeight = el ? el.offsetHeight : 0;
    }
  }

  // responsive orientation
  function currentRankdir(): 'LR' | 'TB' {
    // favor horizontal when viewport is wide
    const wide = containerWidth >= 900 || containerWidth > containerHeight * 1.2;
    return wide ? 'LR' : 'TB';
  }

  $: data = $diagramStore;
  $: layoutNodes = computeLayout(data.nodes, data.edges, containerWidth, containerHeight,
                                 { rankdir: currentRankdir() });
  $: layoutData = { nodes: layoutNodes, edges: data.edges };

  function getNodeById(id: string): Node | undefined {
    return layoutData.nodes.find(node => node.id === id);
  }

  function getNodeBounds(n: Node) {
    if (n.type === 'external' && n.radius) {
      const d = (n.radius ?? 50) * 2;
      return { x: n.x, y: n.y, width: d, height: d };
    }
    return { x: n.x, y: n.y, width: n.width ?? 150, height: n.height ?? 80 };
  }

  function contentBounds(nodes: Node[]) {
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const n of nodes) {
      const b = getNodeBounds(n);
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
    if (!nodes.length) return { minX:0,minY:0,maxX:0,maxY:0 };
    return { minX, minY, maxX, maxY };
  }

  function getNodeCenter(node: Node): { x: number; y: number } {
    if (node.type === 'external' && node.radius) {
      return { 
        x: node.x + (node.radius || 50), 
        y: node.y + (node.radius || 50) 
      };
    }
    return {
      x: node.x + (node.width || 0) / 2,
      y: node.y + (node.height || 0) / 2
    };
  }

  function fitToScreen(withSafeZone: boolean) {
    const PADDING = 24;
    const { minX, minY, maxX, maxY } = contentBounds(layoutData.nodes);
    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const padTop = PADDING, padLeft = PADDING, padRight = PADDING;
    const padBottom = withSafeZone ? PADDING + promptBarHeight + 16 : PADDING;

    const availW = containerWidth  - (padLeft + padRight);
    const availH = containerHeight - (padTop  + padBottom);

    const s = Math.min(1, Math.min(availW / contentW, availH / contentH));
    scale = Number.isFinite(s) && s > 0 ? Math.max(SCALE_MIN, Math.min(SCALE_MAX, s)) : 1;

    // center after scaling
    const scaledW = contentW * scale, scaledH = contentH * scale;
    const targetX = padLeft + (availW - scaledW) / 2;
    const targetY = padTop  + (availH - scaledH) / 2;

    panX = targetX - minX * scale;
    panY = targetY - minY * scale;
  }

  function updateContainerSize() {
    if (typeof document === 'undefined' || !svgEl) return;
    const r = svgEl.getBoundingClientRect();
    containerWidth = r.width; containerHeight = r.height;
  }

  // zoom helpers
  function zoomTo(cx: number, cy: number, factor: number) {
    const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale * factor));
    const k = newScale / scale;
    // keep cursor point stable: adjust pan so (cx,cy) stays put
    panX = cx - k * (cx - panX);
    panY = cy - k * (cy - panY);
    scale = newScale;
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    hasInteracted = true;
    const rect = svgEl.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = Math.exp(-(e.deltaY) * 0.0015);
    zoomTo(cx, cy, factor);
  }

  // pan (mouse & touch)
  let dragging = false, lastX = 0, lastY = 0, pointers = new Map<number,{x:number,y:number}>();
  function onPointerDown(e: PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { dragging = true; lastX = e.clientX; lastY = e.clientY; }
    hasInteracted = true;
  }
  function onPointerMove(e: PointerEvent) {
    const prev = pointers.get(e.pointerId);
    if (prev) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // pinch zoom when 2 pointers
    if (pointers.size === 2) {
      const [a,b] = [...pointers.values()];
      const distNow = Math.hypot(a.x - b.x, a.y - b.y);
      const distPrev = Math.hypot((prev?.x ?? a.x) - b.x, (prev?.y ?? a.y) - b.y);
      if (distPrev > 0) {
        const rect = svgEl.getBoundingClientRect();
        const cx = (a.x + b.x)/2 - rect.left;
        const cy = (a.y + b.y)/2 - rect.top;
        zoomTo(cx, cy, distNow / distPrev);
      }
      return;
    }

    if (dragging) {
      panX += (e.clientX - lastX);
      panY += (e.clientY - lastY);
      lastX = e.clientX; lastY = e.clientY;
    }
  }
  function onPointerUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) dragging = false;
  }

  // buttons
  function zoomIn()  { hasInteracted = true; const r = svgEl.getBoundingClientRect(); zoomTo(r.width/2, r.height/2, 1.1); }
  function zoomOut() { hasInteracted = true; const r = svgEl.getBoundingClientRect(); zoomTo(r.width/2, r.height/2, 1/1.1); }
  function resetView() { hasInteracted = false; measurePromptBar(); fitToScreen(true); }

  onMount(() => {
    updateContainerSize();
    measurePromptBar();
    // initial safe-fit (do not overlap prompt bar)
    fitToScreen(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        updateContainerSize();
        measurePromptBar();
        // if user has interacted, keep current pan/zoom; otherwise re-fit with safe-zone
        if (!hasInteracted) fitToScreen(true);
      });
    }
  });

  // re-fit when layout changes and user hasn't interacted yet
  $: if (layoutData && !hasInteracted) {
    measurePromptBar();
    fitToScreen(true);
  }

  function rectIntersection(p: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }): { x: number; y: number } {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const dx = p.x - centerX;
    const dy = p.y - centerY;
    
    if (Math.abs(dx) * rect.height <= Math.abs(dy) * rect.width) {
      // Intersection with top or bottom edge
      const sign = dy > 0 ? 1 : -1;
      return { x: centerX + (dx * rect.height) / (2 * Math.abs(dy)), y: centerY + sign * rect.height / 2 };
    } else {
      // Intersection with left or right edge
      const sign = dx > 0 ? 1 : -1;
      return { x: centerX + sign * rect.width / 2, y: centerY + (dy * rect.width) / (2 * Math.abs(dx)) };
    }
  }

  function circleIntersection(p: { x: number; y: number }, c: { x: number; y: number }, r: number): { x: number; y: number } {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: c.x + r, y: c.y };
    
    return {
      x: c.x + (dx * r) / distance,
      y: c.y + (dy * r) / distance
    };
  }

  function getIntersection(source: Node, target: Node): { x1: number; y1: number; x2: number; y2: number } {
    const sourceCenter = getNodeCenter(source);
    const targetCenter = getNodeCenter(target);
    
    let x1: number, y1: number, x2: number, y2: number;
    
    if (source.type === 'external') {
      const intersection = circleIntersection(targetCenter, sourceCenter, source.radius || 50);
      x1 = intersection.x;
      y1 = intersection.y;
    } else {
      const sourceBounds = getNodeBounds(source);
      const intersection = rectIntersection(targetCenter, sourceBounds);
      x1 = intersection.x;
      y1 = intersection.y;
    }
    
    if (target.type === 'external') {
      const intersection = circleIntersection(sourceCenter, targetCenter, target.radius || 50);
      x2 = intersection.x;
      y2 = intersection.y;
    } else {
      const targetBounds = getNodeBounds(target);
      const intersection = rectIntersection(sourceCenter, targetBounds);
      x2 = intersection.x;
      y2 = intersection.y;
    }
    
    return { x1, y1, x2, y2 };
  }


</script>

<div class="h-full w-full bg-gray-100 dark:bg-gray-900 
            bg-[radial-gradient(circle_at_1px_1px,rgb(156_163_175)_1px,transparent_0)] 
            dark:bg-[radial-gradient(circle_at_1px_1px,rgb(75_85_99)_1px,transparent_0)] 
            bg-[size:18px_18px] touch-none">
  <svg bind:this={svgEl}
       class="w-full h-full"
       viewBox={`0 0 ${containerWidth} ${containerHeight}`}
       on:wheel={onWheel}
       on:pointerdown={onPointerDown}
       on:pointermove={onPointerMove}
       on:pointerup={onPointerUp}
       on:pointercancel={onPointerUp}>
    <g id="diagram" transform={`translate(${panX},${panY}) scale(${scale})`}>

      <!-- EDGES -->
      <g id="edges">
        {#each layoutData.edges as edge}
          {@const sourceNode = getNodeById(edge.source)}
          {@const targetNode = getNodeById(edge.target)}
          {#if sourceNode && targetNode}
            {@const PAD = 8}
            {@const { x1, y1, x2, y2 } = getIntersection(sourceNode, targetNode)}
            {@const dx = x2 - x1}
            {@const dy = y2 - y1}
            {@const length = Math.sqrt(dx * dx + dy * dy)}
            {@const ux = dx / length}
            {@const uy = dy / length}
            <line x1={x1 + ux * PAD} y1={y1 + uy * PAD} x2={x2 - ux * PAD} y2={y2 - uy * PAD}
                  stroke-width="2" marker-end="url(#arrow)"
                  class="stroke-gray-400 dark:stroke-gray-600"/>
          {/if}
        {/each}
      </g>

      <!-- Arrow marker definition -->
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
        </marker>
      </defs>

      <!-- NODES -->
      <g id="nodes">
        {#each layoutData.nodes as node}
          {#if node.type === 'component'}
            <!-- Rectangle for components -->
            <rect
              x={node.x}
              y={node.y}
              width={node.width || 150}
              height={node.height || 80}
              fill="rgb(243 244 246)"
              stroke="rgb(55 65 81)"
              stroke-width="2"
              rx="4"
              class="dark:fill-gray-800 dark:stroke-gray-600"
            />
            <text
              x={node.x + (node.width || 150) / 2}
              y={node.y + (node.height || 80) / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="text-sm font-medium fill-gray-700 dark:fill-gray-200 capitalize"
            >
              {node.label}
            </text>
          {:else if node.type === 'external'}
            <!-- Circle for external APIs -->
            <circle
              cx={node.x + (node.radius || 50)}
              cy={node.y + (node.radius || 50)}
              r={node.radius || 50}
              fill="rgb(224 242 254)"
              stroke="rgb(14 165 233)"
              stroke-width="2"
              class="dark:fill-sky-800 dark:stroke-sky-400"
            />
            <text
              x={node.x + (node.radius || 50)}
              y={node.y + (node.radius || 50)}
              text-anchor="middle"
              dominant-baseline="middle"
              class="text-sm font-medium fill-sky-700 dark:fill-sky-200 capitalize"
            >
              {node.label}
            </text>
          {:else if node.type === 'datastore'}
            <!-- Cylinder for data stores -->
            <ellipse
              cx={node.x + (node.width || 120) / 2}
              cy={node.y}
              rx={(node.width || 120) / 2}
              ry="15"
              fill="rgb(254 243 199)"
              stroke="rgb(245 158 11)"
              stroke-width="2"
              class="dark:fill-amber-700 dark:stroke-amber-400"
            />
            <rect
              x={node.x}
              y={node.y}
              width={node.width || 120}
              height={node.height || 80}
              fill="rgb(254 243 199)"
              stroke="rgb(245 158 11)"
              stroke-width="2"
              class="dark:fill-amber-700 dark:stroke-amber-400"
            />
            <ellipse
              cx={node.x + (node.width || 120) / 2}
              cy={node.y + (node.height || 80)}
              rx={(node.width || 120) / 2}
              ry="15"
              fill="rgb(254 243 199)"
              stroke="rgb(245 158 11)"
              stroke-width="2"
              class="dark:fill-amber-700 dark:stroke-amber-400"
            />
            <text
              x={node.x + (node.width || 120) / 2}
              y={node.y + (node.height || 80) / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              class="text-sm font-medium fill-amber-700 dark:fill-amber-200 capitalize"
            >
              {node.label}
            </text>
          {:else if node.type === 'custom'}
            <!-- Custom shapes based on shape property -->
            {#if node.shape === 'hexagon'}
              <!-- Hexagon for load balancers, etc. -->
              <polygon
                points="{node.x + (node.width || 100) / 2},{node.y} {node.x + (node.width || 100)},{node.y + (node.height || 60) * 0.25} {node.x + (node.width || 100)},{node.y + (node.height || 60) * 0.75} {node.x + (node.width || 100) / 2},{node.y + (node.height || 60)} {node.x},{node.y + (node.height || 60) * 0.75} {node.x},{node.y + (node.height || 60) * 0.25}"
                fill="rgb(236 254 255)"
                stroke="rgb(6 182 212)"
                stroke-width="2"
                class="dark:fill-cyan-800 dark:stroke-cyan-400"
              />
              <text
                x={node.x + (node.width || 100) / 2}
                y={node.y + (node.height || 60) / 2}
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-sm font-medium fill-cyan-700 dark:fill-cyan-200 capitalize"
              >
                {node.label}
              </text>
            {:else if node.shape === 'diamond'}
              <!-- Diamond for decision points, etc. -->
              <polygon
                points="{node.x + (node.width || 100) / 2},{node.y} {node.x + (node.width || 100)},{node.y + (node.height || 60) / 2} {node.x + (node.width || 100) / 2},{node.y + (node.height || 60)} {node.x},{node.y + (node.height || 60) / 2}"
                fill="rgb(254 226 226)"
                stroke="rgb(239 68 68)"
                stroke-width="2"
                class="dark:fill-red-800 dark:stroke-red-400"
              />
              <text
                x={node.x + (node.width || 100) / 2}
                y={node.y + (node.height || 60) / 2}
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-sm font-medium fill-red-700 dark:fill-red-200 capitalize"
              >
                {node.label}
              </text>
            {:else if node.shape === 'triangle'}
              <!-- Triangle for special services -->
              <polygon
                points="{node.x + (node.width || 100) / 2},{node.y} {node.x + (node.width || 100)},{node.y + (node.height || 60)} {node.x},{node.y + (node.height || 60)}"
                fill="rgb(240 253 244)"
                stroke="rgb(34 197 94)"
                stroke-width="2"
                class="dark:fill-green-800 dark:stroke-green-400"
              />
              <text
                x={node.x + (node.width || 100) / 2}
                y={node.y + (node.height || 60) * 0.67}
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-sm font-medium fill-green-700 dark:fill-green-200 capitalize"
              >
                {node.label}
              </text>
            {:else}
              <!-- Default to rectangle for unknown custom shapes -->
              <rect
                x={node.x}
                y={node.y}
                width={node.width || 150}
                height={node.height || 80}
                fill="rgb(243 244 246)"
                stroke="rgb(55 65 81)"
                stroke-width="2"
                rx="4"
                class="dark:fill-gray-800 dark:stroke-gray-600"
              />
              <text
                x={node.x + (node.width || 150) / 2}
                y={node.y + (node.height || 80) / 2}
                text-anchor="middle"
                dominant-baseline="middle"
                class="text-sm font-medium fill-gray-700 dark:fill-gray-200 capitalize"
              >
                {node.label}
              </text>
            {/if}
          {/if}
        {/each}
      </g>

      <!-- LABELS -->
      <g id="labels" class="pointer-events-none">
        {#each layoutData.edges as edge}
          {@const sourceNode = getNodeById(edge.source)}
          {@const targetNode = getNodeById(edge.target)}
          {#if sourceNode && targetNode && edge.label}
            {@const { x1, y1, x2, y2 } = getIntersection(sourceNode, targetNode)}
            {@const midX = (x1 + x2) / 2}
            {@const midY = (y1 + y2) / 2}
            {@const labelWidth = Math.max(edge.label.length * 7, 40)}
            {@const labelHeight = 20}
            <rect 
              x={midX - labelWidth/2 - 2} 
              y={midY - labelHeight/2 - 2} 
              width={labelWidth + 4} 
              height={labelHeight + 4}
              rx="3" 
              fill="white" 
              opacity="0.9"
              class="dark:fill-[#202123]"
            />
            <text 
              x={midX} 
              y={midY}
              text-anchor="middle" 
              dominant-baseline="central"
              class="text-[11px] font-semibold fill-gray-700 dark:fill-gray-200 capitalize"
            >
              {edge.label}
            </text>
          {/if}
        {/each}
      </g>
    </g>
  </svg>

  <!-- Zoom controls -->
  <div class="absolute top-4 right-4 z-40 flex flex-col gap-2">
    <button class="w-9 h-9 rounded bg-gray-800/70 text-white hover:bg-gray-700/70 transition-colors flex items-center justify-center" on:click={zoomIn}>＋</button>
    <button class="w-9 h-9 rounded bg-gray-800/70 text-white hover:bg-gray-700/70 transition-colors flex items-center justify-center" on:click={zoomOut}>－</button>
    <button class="w-9 h-9 rounded bg-gray-800/70 text-white hover:bg-gray-700/70 transition-colors flex items-center justify-center" on:click={resetView}>⟲</button>
  </div>
</div> 