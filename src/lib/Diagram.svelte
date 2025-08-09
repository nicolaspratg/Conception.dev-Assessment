<script lang="ts">
  import { SHAPES, type ShapeType } from './diagram/constants.js';
  import { diagramStore } from './stores/diagramStore.js';
  import type { DiagramData, Node } from './types/diagram.js';
  import { computeLayout } from './layout.js';
  import { onMount } from 'svelte';

  let containerWidth = 600;
  let containerHeight = 400;
  let svgElement: SVGElement;

  $: data = $diagramStore;
  $: lastUpdated = new Date().toLocaleTimeString();
  $: layoutData = {
    nodes: computeLayout(data.nodes, data.edges, containerWidth, containerHeight),
    edges: data.edges
  };

  // Reset occupied areas when layout changes
  $: {
    occupiedAreas = [];
  }

  const PADDING = 24;

  function boundsOf(nodes: Node[]) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
      const bounds = getNodeBounds(node);
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    return { minX, minY, maxX, maxY };
  }

  // Calculate graph bounds using actual node bounds
  $: ({ minX, minY, maxX, maxY } = boundsOf(layoutData.nodes));
  
  // Compute offset to clamp content within viewport with padding
  $: offsetX = Math.min(0, containerWidth - PADDING - maxX) + Math.max(0, PADDING - minX);
  $: offsetY = Math.min(0, containerHeight - PADDING - maxY) + Math.max(0, PADDING - minY);

  // Shared occupied areas for edge labels
  let occupiedAreas: { x: number; y: number; w: number; h: number }[] = [];

  function boxesOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
    return !(
      a.x + a.w < b.x ||
      a.x > b.x + b.w ||
      a.y + a.h < b.y ||
      a.y > b.y + b.h
    );
  }

  function isLabelAreaFree(box: { x: number; y: number; w: number; h: number }) {
    return (
      !isLabelColliding(box.x, box.y, box.w, box.h) &&
      !occupiedAreas.some((o) => boxesOverlap(o, box))
    );
  }

  function getNodeById(id: string): Node | undefined {
    return layoutData.nodes.find(node => node.id === id);
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

  function getNodeBounds(node: Node): { x: number; y: number; width: number; height: number } {
    if (node.type === 'external' && node.radius) {
      const r = node.radius || 50;
      return { x: node.x, y: node.y, width: r * 2, height: r * 2 };
    }
    return {
      x: node.x,
      y: node.y,
      width: node.width || 150,
      height: node.height || 80
    };
  }

  function isLabelColliding(labelX: number, labelY: number, labelWidth: number, labelHeight: number): boolean {
    const labelBounds = { x: labelX, y: labelY, width: labelWidth, height: labelHeight };
    
    return layoutData.nodes.some(node => {
      const nodeBounds = getNodeBounds(node);
      
      // Add more padding to avoid collisions
      const padding = 15;
      const expandedNodeBounds = {
        x: nodeBounds.x - padding,
        y: nodeBounds.y - padding,
        width: nodeBounds.width + padding * 2,
        height: nodeBounds.height + padding * 2
      };
      
      return !(labelBounds.x + labelBounds.width < expandedNodeBounds.x ||
               labelBounds.x > expandedNodeBounds.x + expandedNodeBounds.width ||
               labelBounds.y + labelBounds.height < expandedNodeBounds.y ||
               labelBounds.y > expandedNodeBounds.y + expandedNodeBounds.height);
    });
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

  function updateContainerSize() {
    if (svgElement) {
      const rect = svgElement.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    }
  }

  onMount(() => {
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  });
</script>

<div class="h-full w-full bg-gray-100 dark:bg-gray-900 bg-[radial-gradient(circle_at_1px_1px,rgb(156_163_175)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(75_85_99)_1px,transparent_0)] bg-[size:18px_18px]">
  <svg bind:this={svgElement} class="w-full h-full" viewBox="0 0 {containerWidth} {containerHeight}">
    <g id="diagram" transform="translate({offsetX}, {offsetY})">
      <!-- Render edges first (so they appear behind nodes) -->
    {#each layoutData.edges as edge}
      {@const sourceNode = getNodeById(edge.source)}
      {@const targetNode = getNodeById(edge.target)}
      {#if sourceNode && targetNode}
        {@const intersection = getIntersection(sourceNode, targetNode)}
        {@const x1 = intersection.x1}
        {@const y1 = intersection.y1}
        {@const x2 = intersection.x2}
        {@const y2 = intersection.y2}
        {@const midX = (x1 + x2) / 2}
        {@const midY = (y1 + y2) / 2}
        {@const labelOffset = 35}
        {@const textWidth = Math.max(edge.label.length * 7, 40)}
        {@const textHeight = 20}
        {@const positions = [
          { x: midX, y: midY - labelOffset, anchor: 'middle', dy: '-8' }, // above
          { x: midX, y: midY + labelOffset, anchor: 'middle', dy: '16' },  // below
          { x: midX - labelOffset, y: midY, anchor: 'end', dy: '4' },      // left
          { x: midX + labelOffset, y: midY, anchor: 'start', dy: '4' }     // right
        ]}
        {@const candidate = positions.find(p => {
          const bx = p.x - (p.anchor === 'middle' ? textWidth / 2 : p.anchor === 'end' ? textWidth : 0);
          const by = p.y - textHeight / 2;
          return isLabelAreaFree({ x: bx, y: by, w: textWidth, h: textHeight });
        })}

        {@const bestPosition = candidate || (() => {
          // keep moving upward until free
          let offset = labelOffset + 20;
          let trial = null;
          while (!trial && offset < 200) {
            const pos = { x: midX, y: midY - offset, anchor: 'middle', dy: '-8' };
            const bx = pos.x - textWidth / 2;
            const by = pos.y - textHeight / 2;
            if (isLabelAreaFree({ x: bx, y: by, w: textWidth, h: textHeight })) {
              trial = pos;
            }
            offset += 20;
          }
          return trial || { x: midX, y: midY - 50, anchor: 'middle', dy: '-8' };
        })()}

        {@const bx = bestPosition.x - (bestPosition.anchor === 'middle' ? textWidth / 2 : bestPosition.anchor === 'end' ? textWidth : 0)}
        {@const by = bestPosition.y - textHeight / 2}
        {@const textX = bx + textWidth / 2}
        {@const textY = by + textHeight / 2}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke-width="2"
          marker-end="url(#arrow)"
          class="stroke-gray-400 dark:stroke-gray-600"
        />
        <!-- Background rectangle for text -->
        <rect
          x={bx - 2}
          y={by - 2}
          width={textWidth + 4}
          height={textHeight + 4}
          rx="3"
          fill="white"
          opacity="0.9"
          class="dark:fill-[#202123]"
        />
        <text
          x={textX}
          y={textY}
          text-anchor="middle"
          dominant-baseline="central"
          class="text-[11px] font-semibold fill-gray-700 dark:fill-gray-200 pointer-events-none capitalize"
        >
          {edge.label}
        </text>
      {/if}
    {/each}

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

    <!-- Render nodes -->
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
  </svg>
</div> 