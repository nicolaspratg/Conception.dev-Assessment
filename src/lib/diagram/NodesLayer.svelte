<script lang="ts">
  import type { Node } from '../types/diagram';

  export let nodes: Node[] = [];
</script>

<!-- NODES -->
<g id="nodes">
  {#each nodes as node}
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
      <!-- center coordinates -->
      {@const cx = node.x + (node.width ?? 150) / 2}
      {@const cy = node.y + (node.height ?? 80) / 2}
      {@const lines = node.labelLines ?? [node.label]}
      {@const lh = node.lineHeight ?? 20}
      {@const startY = cy - ((lines.length - 1) * lh) / 2}

      <text text-anchor="middle" dominant-baseline="alphabetic"
        class="text-sm font-medium fill-gray-700 dark:fill-gray-200">
        {#each lines as line, i}
          <tspan x={cx} y={startY + i * lh}>{line}</tspan>
        {/each}
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
      {@const cx = node.x + (node.radius ?? 50)}
      {@const cy = node.y + (node.radius ?? 50)}
      {@const lines = node.labelLines ?? [node.label]}
      {@const lh = node.lineHeight ?? 20}
      {@const startY = cy - ((lines.length - 1) * lh) / 2}
      <text text-anchor="middle" dominant-baseline="alphabetic"
        class="text-sm font-medium fill-sky-700 dark:fill-sky-200">
        {#each lines as line, i}
          <tspan x={cx} y={startY + i * lh}>{line}</tspan>
        {/each}
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
      <!-- center coordinates -->
      {@const cx = node.x + (node.width ?? 120) / 2}
      {@const cy = node.y + (node.height ?? 80) / 2}
      {@const lines = node.labelLines ?? [node.label]}
      {@const lh = node.lineHeight ?? 20}
      {@const startY = cy - ((lines.length - 1) * lh) / 2}

      <text text-anchor="middle" dominant-baseline="alphabetic"
        class="text-sm font-medium fill-amber-700 dark:fill-amber-200">
        {#each lines as line, i}
          <tspan x={cx} y={startY + i * lh}>{line}</tspan>
        {/each}
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
        <!-- center coordinates -->
        {@const cx = node.x + (node.width ?? 100) / 2}
        {@const cy = node.y + (node.height ?? 60) / 2}
        {@const lines = node.labelLines ?? [node.label]}
        {@const lh = node.lineHeight ?? 20}
        {@const startY = cy - ((lines.length - 1) * lh) / 2}

        <text text-anchor="middle" dominant-baseline="alphabetic"
          class="text-sm font-medium fill-cyan-700 dark:fill-cyan-200">
          {#each lines as line, i}
            <tspan x={cx} y={startY + i * lh}>{line}</tspan>
          {/each}
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
        <!-- center coordinates -->
        {@const cx = node.x + (node.width ?? 100) / 2}
        {@const cy = node.y + (node.height ?? 60) / 2}
        {@const lines = node.labelLines ?? [node.label]}
        {@const lh = node.lineHeight ?? 20}
        {@const startY = cy - ((lines.length - 1) * lh) / 2}

        <text text-anchor="middle" dominant-baseline="alphabetic"
          class="text-sm font-medium fill-red-700 dark:fill-red-200">
          {#each lines as line, i}
            <tspan x={cx} y={startY + i * lh}>{line}</tspan>
          {/each}
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
        <!-- center coordinates -->
        {@const cx = node.x + (node.width ?? 100) / 2}
        {@const cy = node.y + (node.height ?? 60) * 0.67}
        {@const lines = node.labelLines ?? [node.label]}
        {@const lh = node.lineHeight ?? 20}
        {@const startY = cy - ((lines.length - 1) * lh) / 2}

        <text text-anchor="middle" dominant-baseline="alphabetic"
          class="text-sm font-medium fill-green-700 dark:fill-green-200">
          {#each lines as line, i}
            <tspan x={cx} y={startY + i * lh}>{line}</tspan>
          {/each}
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
        <!-- center coordinates -->
        {@const cx = node.x + (node.width ?? 150) / 2}
        {@const cy = node.y + (node.height ?? 80) / 2}
        {@const lines = node.labelLines ?? [node.label]}
        {@const lh = node.lineHeight ?? 20}
        {@const startY = cy - ((lines.length - 1) * lh) / 2}

        <text text-anchor="middle" dominant-baseline="alphabetic"
          class="text-sm font-medium fill-gray-700 dark:fill-gray-200">
          {#each lines as line, i}
            <tspan x={cx} y={startY + i * lh}>{line}</tspan>
          {/each}
        </text>
      {/if}
    {/if}
  {/each}
</g>
