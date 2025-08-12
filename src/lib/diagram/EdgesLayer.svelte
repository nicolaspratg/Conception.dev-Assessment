<script lang="ts">
  import type { Node, Edge } from '../types/diagram';
  import { uiScale } from '../uiScale';

  export let edges: Edge[] = [];
  export let nodes: Node[] = [];

  // Global flag for arrowheads (optional)
  const DEFAULT_DIRECTED = true; // flip to false if you prefer plain lines by default
  
  // Get the current UI scale factor
  const s = uiScale();

  // Function to split text into lines for better readability
  function splitTextIntoLines(text: string, maxWordsPerLine: number = 2): string[] {
    if (!text || text.trim() === '') return [];
    
    const words = text.trim().split(' ');
    const lines: string[] = [];
    
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      lines.push(words.slice(i, i + maxWordsPerLine).join(' '));
    }
    
    return lines;
  }

  // Function to calculate text dimensions for multi-line text
  function getTextDimensions(lines: string[], fontSize: number = 11): { width: number; height: number } {
    if (lines.length === 0) return { width: 40 * s, height: 20 * s };
    
    const lineHeight = fontSize * 1.2; // 1.2 line height
    const height = lines.length * lineHeight * s;
    
    // Estimate width based on longest line (rough approximation)
    const longestLine = lines.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '');
    const BASE_CHAR_PX = 7;       // original assumption
    const MIN_PILL_PX = 40;
    const width = Math.max(longestLine.length * BASE_CHAR_PX * s, MIN_PILL_PX * s);
    
    return { width, height };
  }

  // Function to create SVG path from dagre points
  function createPathFromPoints(points: Array<{ x: number; y: number }>): string {
    if (!points || points.length < 2) return '';
    
    const [first, ...rest] = points;
    let path = `M ${first.x} ${first.y}`;
    
    for (const point of rest) {
      path += ` L ${point.x} ${point.y}`;
    }
    
    return path;
  }

  // Function to create path with arrow marker positioning
  function createPathWithArrow(points: Array<{ x: number; y: number }>): string {
    if (!points || points.length < 2) return '';
    
    // Create the main path
    const [first, ...rest] = points;
    let path = `M ${first.x} ${first.y}`;
    
    for (const point of rest) {
      path += ` L ${point.x} ${point.y}`;
    }
    
    return path;
  }
</script>

<!-- EDGES -->
<g id="edges">
  {#each edges as edge}
    {#if edge.points && edge.points.length >= 2}
      <path 
        d={createPathWithArrow(edge.points)}
        stroke-width="2" 
        marker-end={edge.directed ?? DEFAULT_DIRECTED ? 'url(#arrow)' : undefined}
        fill="none"
        class="stroke-gray-400 dark:stroke-gray-600"
      />
    {:else}
      <!-- Fallback: simple line if no points -->
      {@const sourceNode = nodes.find(n => n.id === edge.source)}
      {@const targetNode = nodes.find(n => n.id === edge.target)}
      {#if sourceNode && targetNode}
        {@const sourceWidth = sourceNode.width ?? 150}
        {@const sourceHeight = sourceNode.height ?? 80}
        {@const targetWidth = targetNode.width ?? 150}
        {@const targetHeight = targetNode.height ?? 80}
        <line 
          x1={sourceNode.x} 
          y1={sourceNode.y}
          x2={targetNode.x} 
          y2={targetNode.y}
          stroke-width="2" 
          marker-end={edge.directed ?? DEFAULT_DIRECTED ? 'url(#arrow)' : undefined}
          class="stroke-gray-400 dark:stroke-gray-600"
        />
      {/if}
    {/if}
  {/each}
</g>

<!-- LABELS -->
<g id="labels" class="pointer-events-none">
  {#each edges as edge}
    {#if edge.label && edge.labelX !== undefined && edge.labelY !== undefined}
      {@const lines = splitTextIntoLines(edge.label)}
      {@const chipW = (edge as any)._chipW ?? getTextDimensions(lines).width}
      {@const chipH = (edge as any)._chipH ?? getTextDimensions(lines).height}
      <rect 
        x={edge.labelX - chipW/2} 
        y={edge.labelY - chipH/2} 
        width={chipW} 
        height={chipH}
        rx="3" 
        fill="rgba(255, 255, 255, 0.95)"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        class="dark:fill-gray-800/95 dark:stroke-gray-600/30"
      />
              <text 
          x={edge.labelX} 
          y={edge.labelY - (lines.length - 1) * 6.6 * s}
          text-anchor="middle" 
          dominant-baseline="central"
          class="text-[11px] font-semibold fill-gray-700 dark:fill-gray-200 capitalize"
        >
          {#each lines as line, i}
            <tspan x={edge.labelX} dy={i === 0 ? 0 : 13.2 * s}>{line}</tspan>
          {/each}
        </text>
    {:else if edge.label}
      <!-- Fallback: center label if no dagre coordinates -->
      {@const sourceNode = nodes.find(n => n.id === edge.source)}
      {@const targetNode = nodes.find(n => n.id === edge.target)}
      {#if sourceNode && targetNode}
        {@const midX = (sourceNode.x + targetNode.x) / 2}
        {@const midY = (sourceNode.y + targetNode.y) / 2}
        {@const lines = splitTextIntoLines(edge.label)}
        {@const chipW = (edge as any)._chipW ?? getTextDimensions(lines).width}
        {@const chipH = (edge as any)._chipH ?? getTextDimensions(lines).height}
        <rect 
          x={midX - chipW/2} 
          y={midY - chipH/2} 
          width={chipW} 
          height={chipH}
          rx="3" 
          fill="rgba(255, 255, 255, 0.95)"
          stroke="rgba(0, 0, 0, 0.1)"
          stroke-width="1"
          class="dark:fill-gray-800/95 dark:stroke-gray-600/30"
        />
        <text 
          x={midX} 
          y={midY - (lines.length - 1) * 6.6 * s}
          text-anchor="middle" 
          dominant-baseline="central"
          class="text-[11px] font-semibold fill-gray-700 dark:fill-gray-200 capitalize"
        >
          {#each lines as line, i}
            <tspan x={midX} dy={i === 0 ? 0 : 13.2 * s}>{line}</tspan>
          {/each}
        </text>
      {/if}
    {/if}
  {/each}
</g>
