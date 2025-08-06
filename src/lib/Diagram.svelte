<script lang="ts">
  import { SHAPES, type ShapeType } from './diagram/constants.js';
  import diagramData from './diagram/example-diagram.json';

  interface Node {
    id: string;
    type: ShapeType;
    label: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
  }

  interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
  }

  interface DiagramData {
    nodes: Node[];
    edges: Edge[];
  }

  const data: DiagramData = diagramData;

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

<div class="w-full h-full bg-gray-50 p-4">
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
          fill="#3b82f6"
          stroke="#1d4ed8"
          stroke-width="2"
          rx="4"
        />
        <text
          x={node.x + (node.width || 150) / 2}
          y={node.y + (node.height || 80) / 2}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-white"
        >
          {node.label}
        </text>
      {:else if node.type === 'external'}
        <!-- Circle for external APIs -->
        <circle
          cx={node.x}
          cy={node.y}
          r={node.radius || 50}
          fill="#10b981"
          stroke="#059669"
          stroke-width="2"
        />
        <text
          x={node.x}
          y={node.y}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-white"
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
          fill="#8b5cf6"
          stroke="#7c3aed"
          stroke-width="2"
        />
        <rect
          x={node.x}
          y={node.y}
          width={node.width || 120}
          height={node.height || 80}
          fill="#8b5cf6"
          stroke="#7c3aed"
          stroke-width="2"
        />
        <ellipse
          cx={node.x + (node.width || 120) / 2}
          cy={node.y + (node.height || 80)}
          rx={(node.width || 120) / 2}
          ry="15"
          fill="#8b5cf6"
          stroke="#7c3aed"
          stroke-width="2"
        />
        <text
          x={node.x + (node.width || 120) / 2}
          y={node.y + (node.height || 80) / 2}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-sm font-medium fill-white"
        >
          {node.label}
        </text>
      {/if}
    {/each}
  </svg>
</div> 