<script lang="ts">
  import { computeLayout } from './layout';
  import { diagramStore } from './stores/diagramStore';
  import type { Node } from './types/diagram';
  import { onMount, onDestroy } from 'svelte';
  let Panzoom: any;

  let svgElement: SVGSVGElement;
  let diagramGroup: SVGGElement;
  let containerWidth = 1000, containerHeight = 600;

  // zoom/pan
  let hasInteracted = false;
  let curX = 0, curY = 0, curScale = 1; // live transform cache
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  let pz: any = null;

  function clamp(v: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, v));
  }

  // UX polish: hide diagram until initial fit is applied
  let initialFitDone = false;
  let svgReady = false; // controls opacity/visibility of the SVG

  // Calculate initial position when we have data AND measurements
  $: if (layoutData?.nodes?.length && measurementsReady && !initialFitDone) {
    const t = getFitTransform(true);
    curX = t.x;
    curY = t.y;
    curScale = t.scale;
  }

  function showSvgOnceFitted() {
    if (!initialFitDone) return;
    if (!svgReady) {
      svgReady = true; // triggers CSS to reveal
    }
  }

  // measurement gating for initial fit
  let promptBarHeight = 0;
  let containerMeasured = false;
  let barMeasured = false;
  let measurementsReady = false;
  let barRO: ResizeObserver;

  function measurePromptBar() {
    const el = document.getElementById('prompt-bar');
    const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
    if (h !== promptBarHeight) promptBarHeight = h;
    barMeasured = true;
    updateMeasurementsReady();
  }

  function measureContainer() {
    updateContainerSize();
    containerMeasured = true;
    updateMeasurementsReady();
  }

  function updateMeasurementsReady() {
    measurementsReady = containerMeasured && barMeasured;
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

  // Return the transform that fits content with optional bottom safe zone
  function getFitTransform(withSafeZone: boolean) {
    const PADDING = 24;
    const BOTTOM_RESERVE = 40;
    const { minX, minY, maxX, maxY } = contentBounds(layoutData.nodes);

    const padTop = PADDING, padLeft = PADDING, padRight = PADDING;
    const measuredBar = Math.max(promptBarHeight, 72);
    const extraBottom = withSafeZone ? (measuredBar + BOTTOM_RESERVE) : 0;
    const padBottom = PADDING + extraBottom;

    const availW = containerWidth  - (padLeft + padRight);
    const availH = containerHeight - (padTop  + padBottom);

    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);

    const scale = Math.min(1, Math.min(availW / contentW, availH / contentH));
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number.isFinite(scale) ? scale : 1));

    const scaledW = contentW * clamped, scaledH = contentH * clamped;
    const targetX = padLeft + (availW - scaledW) / 2;
    const targetY = padTop  + (availH - scaledH) / 2;

    const x = targetX - minX * clamped;
    const y = targetY - minY * clamped;

    return { x, y, scale: clamped };
  }

  function applyTransform(x: number, y: number, scale: number, animate = false) {
    curX = x; curY = y; curScale = scale;          // update cache first
    if (pz) {
      try {
        // Use absolute zoom + pan (order matters)
        pz.zoom(scale, { animate });
        pz.pan(x, y, { animate });
      } catch {
        diagramGroup?.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
      }
    } else {
      diagramGroup?.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
    }
  }

  // Called by Reset button and on first render (when measurements ready)
  function fitToScreen(withSafeZone: boolean, animate = false) {
    const t = getFitTransform(withSafeZone);
    applyTransform(t.x, t.y, t.scale, animate);
  }

  function updateContainerSize() {
    if (typeof document === 'undefined' || !svgElement) return;
    const r = svgElement.getBoundingClientRect();
    containerWidth = r.width; containerHeight = r.height;
  }

  function onWheelCentered(e: WheelEvent) {
    if (!svgElement) return;
    hasInteracted = true;
    e.preventDefault();

    // Zoom factor from deltaY (works for mouse + trackpad)
    const factor = Math.exp(-e.deltaY * 0.0015);

    const rect = svgElement.getBoundingClientRect();
    // Center of the SVG in *local* coords
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Convert that center to world coords using current transform
    const wx = (cx - curX) / curScale;
    const wy = (cy - curY) / curScale;

    const nextScale = clamp(curScale * factor, MIN_SCALE, MAX_SCALE);
    const nextX = cx - wx * nextScale;
    const nextY = cy - wy * nextScale;

    applyTransform(nextX, nextY, nextScale, false);
  }

  function initPanzoom() {
    if (!diagramGroup || pz) return;

    pz = Panzoom(diagramGroup, {
      maxScale: MAX_SCALE,
      minScale: MIN_SCALE,
      step: 0.2,
      animate: true,
      duration: 180,
      setTransform: (elem: SVGGElement, { x, y, scale }: { x: number; y: number; scale: number }) => {
        curX = x; curY = y; curScale = scale;         // <- keep cache in sync
        elem.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);
      }
    });

    // Mark interaction on any gesture start (stops re-fit mid-zoom)
    diagramGroup.addEventListener('panzoomstart', () => { hasInteracted = true; }, { passive: true });

    // Center-anchored wheel zoom (no XY drift)
    svgElement.addEventListener('wheel', onWheelCentered, { passive: false });

    // Make the surface capture touch gestures
    svgElement.style.touchAction = 'none';
    (svgElement.style as any)['overscrollBehavior'] = 'contain';

    // Micro-perf: smoother transforms
    (diagramGroup.style as any).willChange = 'transform';
  }

  // Measurement gating you already have:
  // - containerMeasured, barMeasured, measurementsReady, !hasInteracted
  // After measuring, do:
  function refitIfAllowed() {
    if (layoutData?.nodes?.length && measurementsReady && !hasInteracted) {
      initPanzoom();
      const t = getFitTransform(true);
      applyTransform(t.x, t.y, t.scale, false);
      initialFitDone = true;
      // Show SVG after a brief delay to ensure transform is applied
      requestAnimationFrame(() => {
        svgReady = true;
      });
    }
  }

  function zoomBy(mult: number, animate = true) {
    if (!svgElement) return;
    hasInteracted = true;

    const rect = svgElement.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const wx = (cx - curX) / curScale;
    const wy = (cy - curY) / curScale;

    const nextScale = clamp(curScale * mult, MIN_SCALE, MAX_SCALE);
    const nextX = cx - wx * nextScale;
    const nextY = cy - wy * nextScale;

    applyTransform(nextX, nextY, nextScale, animate);
  }

  // For +/- buttons in your UI:
  function zoomIn()  { zoomBy(1.2); }
  function zoomOut() { zoomBy(1/1.2); }
  function resetView() {
    hasInteracted = false;
    const t = getFitTransform(true);
    applyTransform(t.x, t.y, t.scale, true);
    initialFitDone = true;
    requestAnimationFrame(() => {
      svgReady = true;
    });
  }

  onMount(async () => {
    // Dynamic import to avoid SSR issues
    if (typeof window !== 'undefined') {
      const panzoomModule = await import('@panzoom/panzoom');
      Panzoom = panzoomModule.default;
    }

    // Initial measurements
    measureContainer();
    measurePromptBar();

    // Set up ResizeObserver for prompt bar
    if (typeof window !== 'undefined') {
      const barEl = document.getElementById('prompt-bar');
      if (barEl) {
        barRO = new ResizeObserver(() => {
          measurePromptBar();
          refitIfAllowed();
        });
        barRO.observe(barEl);
      }

      // Window resize handler
      window.addEventListener('resize', () => {
        measureContainer();
        measurePromptBar();
        refitIfAllowed();
      });
    }

    // Ensure initial fit happens after a short delay to allow DOM to be ready
    setTimeout(() => {
      if (layoutData?.nodes?.length && !hasInteracted) {
        refitIfAllowed();
      }
    }, 100);
  });

  onDestroy(() => {
    if (barRO) {
      barRO.disconnect();
    }
    if (pz) {
      svgElement?.removeEventListener('wheel', onWheelCentered as any);
      pz = null;
    }
  });

  // re-fit when layout changes and user hasn't interacted yet
  $: if (layoutData?.nodes?.length && !hasInteracted) {
    refitIfAllowed();
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
  <svg bind:this={svgElement}
       class="w-full h-full transition-opacity duration-150"
       class:opacity-0={!svgReady}
       style="overscroll-behavior: contain"
       viewBox={`0 0 ${containerWidth} ${containerHeight}`}>
    <!-- IMPORTANT: panzoom attaches to this group -->
    <g id="diagram" bind:this={diagramGroup} transform={`translate(${curX},${curY}) scale(${curScale})`}>
      <!-- Transparent hit-rect so gestures always hit the group -->
      <rect x="0" y="0" width={containerWidth} height={containerHeight} fill="transparent" />

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