<script lang="ts">
  import { diagramStore } from './stores/diagramStore';
  import { helpOpen } from './stores/helpStore';
  import { onMount, onDestroy } from 'svelte';
  import Canvas from './diagram/Canvas.svelte';
  import Toolbar from './diagram/Toolbar.svelte';
  import type { DiagramData } from './types/diagram';

  // Measurement gating for initial fit
  let promptBarHeight = 0;
  let containerWidth = 1000, containerHeight = 600;
  let containerMeasured = false;
  let barMeasured = false;
  let measurementsReady = false;
  let barRO: ResizeObserver;
  let canvasRef: any;

  // Determine if prompt bar is fixed (desktop) or floating (mobile)
  let isFixedBar = false;

  function measurePromptBar() {
    const el = document.getElementById('prompt-bar');
    const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
    if (h !== promptBarHeight) promptBarHeight = h;
    barMeasured = true;
    updateMeasurementsReady();
  }

  function measureContainer() {
    if (typeof document === 'undefined') return;
    const container = document.querySelector('.h-full.w-full');
    if (container) {
      const r = container.getBoundingClientRect();
      containerWidth = r.width;
      containerHeight = r.height;
    }
    containerMeasured = true;
    updateMeasurementsReady();
  }

  function updateMeasurementsReady() {
    measurementsReady = containerMeasured && barMeasured;
  }

  // Check if prompt bar is fixed (desktop layout)
  function checkIsFixedBar() {
    isFixedBar = window.matchMedia('(min-width: 640px)').matches;
  }

  onMount(() => {
    // Initial measurements
    measureContainer();
    measurePromptBar();
    checkIsFixedBar();

    // Set up ResizeObserver for prompt bar
    if (typeof window !== 'undefined') {
      const barEl = document.getElementById('prompt-bar');
      if (barEl) {
        barRO = new ResizeObserver(() => {
          measurePromptBar();
        });
        barRO.observe(barEl);
      }

      // Window resize handler
      window.addEventListener('resize', () => {
        measureContainer();
        measurePromptBar();
        checkIsFixedBar();
      });


    }
  });

  onDestroy(() => {
    if (barRO) {
      barRO.disconnect();
    }
  });

  $: data = $diagramStore;
</script>

<div class="h-full w-full bg-gray-100 dark:bg-gray-900 
            bg-[radial-gradient(circle_at_1px_1px,rgb(156_163_175)_1px,transparent_0)] 
            dark:bg-[radial-gradient(circle_at_1px_1px,rgb(75_85_99)_1px,transparent_0)] 
            bg-[size:18px_18px] touch-none">
  <Canvas 
    bind:this={canvasRef}
    nodes={data.nodes}
    edges={data.edges}
    {containerWidth}
    {containerHeight}
  />
  
  <Toolbar 
    onZoomIn={() => canvasRef?.zoomIn()}
    onZoomOut={() => canvasRef?.zoomOut()}
    onReset={() => canvasRef?.resetView()}
  />
</div> 