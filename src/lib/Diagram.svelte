<script lang="ts">
  import { SHAPES, type ShapeType } from './diagram/constants.js';
  import { diagramStore } from './stores/diagramStore.js';
  import type { DiagramData, Node } from './types/diagram.js';

  $: data = $diagramStore;
  $: lastUpdated = new Date().toLocaleTimeString();

  function getNodeById(id: string): Node | undefined {
    return data.nodes.find(node => node.id === id);
  }

  function getNodeCenter(node: Node): { x: number; y: number } {
    if (node.type === 'external' && node.radius) {
      return { x: node.x, y: node.y };
    }
    return {
      x: node.x + (node.width || 0) / 2,
      y: node.y + (node.height || 0) / 2
    };
  }
</script>

<div class="w-full">
  <div class="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
    Last updated: {lastUpdated}
  </div>
  <svg class="w-full h-full" viewBox="0 0 600 400">
    <!-- Render edges first (so they appear behind nodes) -->
    {#each data.edges as edge}
      {@const sourceNode = getNodeById(edge.source)}
      {@const targetNode = getNodeById(edge.target)}
      {#if sourceNode && targetNode}
        {@const sourceCenter = getNodeCenter(sourceNode)}
        {@const targetCenter = getNodeCenter(targetNode)}
        <line
          x1={sourceCenter.x}
          y1={sourceCenter.y}
          x2={targetCenter.x}
          y2={targetCenter.y}
          stroke="#6b7280"
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />
        <text
          x={(sourceCenter.x + targetCenter.x) / 2}
          y={(sourceCenter.y + targetCenter.y) / 2 - 5}
          text-anchor="middle"
          class="text-xs fill-gray-600"
        >
          {edge.label}
        </text>
      {/if}
    {/each}

    <!-- Arrow marker definition -->
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
      </marker>
    </defs>

    <!-- Render nodes -->
    {#each data.nodes as node}
      {#if node.type === 'component'}
        <!-- Rectangle for components -->
        <rect
          x={node.x}
          y={node.y}
          width={node.width || 150}
          height={node.height || 80}
          fill="rgb(241 245 249)"
          stroke="rgb(71 85 105)"
          stroke-width="2"
          rx="4"
          class="dark:fill-slate-800 dark:stroke-slate-600"
        />
        <text
          x={node.x + (node.width || 150) / 2}
          y={node.y + (node.height || 80) / 2}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-slate-700 dark:fill-slate-200"
        >
          {node.label}
        </text>
      {:else if node.type === 'external'}
        <!-- Circle for external APIs -->
        <circle
          cx={node.x}
          cy={node.y}
          r={node.radius || 50}
          fill="rgb(224 242 254)"
          stroke="rgb(14 165 233)"
          stroke-width="2"
          class="dark:fill-sky-900 dark:stroke-sky-400"
        />
        <text
          x={node.x}
          y={node.y}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-sky-700 dark:fill-sky-200"
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
          class="dark:fill-amber-900 dark:stroke-amber-400"
        />
        <rect
          x={node.x}
          y={node.y}
          width={node.width || 120}
          height={node.height || 80}
          fill="rgb(254 243 199)"
          stroke="rgb(245 158 11)"
          stroke-width="2"
          class="dark:fill-amber-900 dark:stroke-amber-400"
        />
        <ellipse
          cx={node.x + (node.width || 120) / 2}
          cy={node.y + (node.height || 80)}
          rx={(node.width || 120) / 2}
          ry="15"
          fill="rgb(254 243 199)"
          stroke="rgb(245 158 11)"
          stroke-width="2"
          class="dark:fill-amber-900 dark:stroke-amber-400"
        />
        <text
          x={node.x + (node.width || 120) / 2}
          y={node.y + (node.height || 80) / 2}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-amber-700 dark:fill-amber-200"
        >
          {node.label}
        </text>
      {/if}
    {/each}
  </svg>
</div> 