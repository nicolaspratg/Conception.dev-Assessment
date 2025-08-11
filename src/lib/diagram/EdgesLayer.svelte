<script lang="ts">
  import type { Node, Edge } from '../types/diagram';
  import { getNodeById, getIntersection } from './intersections';

  export let edges: Edge[] = [];
  export let nodes: Node[] = [];

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
    if (lines.length === 0) return { width: 40, height: 20 };
    
    const lineHeight = fontSize * 1.2; // 1.2 line height
    const height = lines.length * lineHeight;
    
    // Estimate width based on longest line (rough approximation)
    const longestLine = lines.reduce((longest, current) => 
      current.length > longest.length ? current : longest, '');
    const width = Math.max(longestLine.length * 7, 40); // 7px per character estimate
    
    return { width, height };
  }
</script>

<!-- EDGES -->
<g id="edges">
  {#each edges as edge}
    {@const sourceNode = getNodeById(nodes, edge.source)}
    {@const targetNode = getNodeById(nodes, edge.target)}
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

<!-- LABELS -->
<g id="labels" class="pointer-events-none">
  {#each edges as edge}
    {@const sourceNode = getNodeById(nodes, edge.source)}
    {@const targetNode = getNodeById(nodes, edge.target)}
    {#if sourceNode && targetNode && edge.label}
      {@const { x1, y1, x2, y2 } = getIntersection(sourceNode, targetNode)}
      {@const midX = (x1 + x2) / 2}
      {@const midY = (y1 + y2) / 2}
      {@const lines = splitTextIntoLines(edge.label)}
      {@const { width: labelWidth, height: labelHeight } = getTextDimensions(lines)}
      <rect 
        x={midX - labelWidth/2 - 2} 
        y={midY - labelHeight/2 - 2} 
        width={labelWidth + 4} 
        height={labelHeight + 4}
        rx="3" 
        fill="rgba(255, 255, 255, 0.95)"
        stroke="rgba(0, 0, 0, 0.1)"
        stroke-width="1"
        class="dark:fill-gray-800/95 dark:stroke-gray-600/30"
      />
      <text 
        x={midX} 
        y={midY - (lines.length - 1) * 6.6}
        text-anchor="middle" 
        dominant-baseline="central"
        class="text-[11px] font-semibold fill-gray-700 dark:fill-gray-200 capitalize"
      >
        {#each lines as line, i}
          <tspan x={midX} dy={i === 0 ? 0 : 13.2}>{line}</tspan>
        {/each}
      </text>
    {/if}
  {/each}
</g>
