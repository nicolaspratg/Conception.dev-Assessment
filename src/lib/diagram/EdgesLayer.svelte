<script lang="ts">
  import type { Node, Edge } from '../types/diagram';
  import { getNodeById, getIntersection } from './intersections';

  export let edges: Edge[] = [];
  export let nodes: Node[] = [];
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
