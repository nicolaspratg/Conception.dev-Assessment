<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { computeLayout } from '../layout';
  import { getFitTransform, contentBounds, type Insets } from './fit';
  import NodesLayer from './NodesLayer.svelte';
  import EdgesLayer from './EdgesLayer.svelte';
  import Defs from './Defs.svelte';
  import type { Node, Edge } from '../types/diagram';

  export let nodes: Node[] = [];
  export let edges: Edge[] = [];
  export let containerWidth = 1000;
  export let containerHeight = 600;


  // State
  let svgElement: SVGSVGElement;
  let diagramGroup: SVGGElement;
  let hasInteracted = false;
  let scale = 1, panX = 0, panY = 0;
  let initialFitDone = false;
  let svgReady = false;
  const SCALE_MIN = 0.05, SCALE_MAX = 3;
  
  // UI inset measurements
  let insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
  let insetsReady = false;

  // Responsive orientation
  function currentRankdir(): 'LR' | 'TB' {
    const wide = containerWidth >= 900 || containerWidth > containerHeight * 1.2;
    return wide ? 'LR' : 'TB';
  }

  // Layout computation
  $: layoutResult = computeLayout({ nodes, edges });
  $: layoutData = layoutResult;
  
  // Auto-fit when new data arrives and we haven't interacted yet
  $: if (layoutData?.nodes?.length && !hasInteracted && insetsReady && svgElement && !initialFitDone) {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (!hasInteracted && !initialFitDone) {
        console.log('[Canvas] Auto-fitting diagram with', layoutData.nodes.length, 'nodes');
        fitToScreen();
        initialFitDone = true;
        svgReady = true;
      }
    });
  }
  
  // Reset interaction state when new data arrives (for fresh diagrams)
  $: if (layoutData?.nodes?.length && JSON.stringify(layoutData.nodes) !== JSON.stringify(nodes)) {
    // New diagram data arrived, reset interaction state to allow auto-fit
    hasInteracted = false;
    initialFitDone = false;
  }









  function getNodeBounds(n: Node) {
    if (n.type === 'external' && n.radius) {
      const d = (n.radius ?? 50) * 2;
      return { x: n.x, y: n.y, width: d, height: d };
    }
    return { x: n.x, y: n.y, width: n.width ?? 150, height: n.height ?? 80 };
  }

  // client-space visible rect of the SVG minus insets
  function getVisibleClientRect(svg: SVGSVGElement, insets: {top:number;right:number;bottom:number;left:number}) {
    const r = svg.getBoundingClientRect();
    const left   = r.left + insets.left;
    const top    = r.top  + insets.top;
    const width  = Math.max(1, r.width  - insets.left - insets.right);
    const height = Math.max(1, r.height - insets.top  - insets.bottom);
    return { left, top, width, height };
  }

  function getVisibleCenterClient(svg: SVGSVGElement, insets: Insets) {
    const vr = getVisibleClientRect(svg, insets);
    return { clientX: vr.left + vr.width / 2, clientY: vr.top + vr.height / 2 };
  }

  function measureInsetFrom(el: HTMLElement | null, svg: SVGSVGElement, side: 'top'|'right'|'bottom'|'left') {
    if (!el || !svg) return 0;
    const a = el.getBoundingClientRect();
    const b = svg.getBoundingClientRect();
    const interLeft   = Math.max(a.left, b.left);
    const interTop    = Math.max(a.top, b.top);
    const interRight  = Math.min(a.right, b.right);
    const interBottom = Math.min(a.bottom, b.bottom);
    const w = Math.max(0, interRight - interLeft);
    const h = Math.max(0, interBottom - interTop);
    if (w === 0 || h === 0) return 0; // not overlapping

    switch (side) {
      case 'top':    return Math.max(0, interTop - b.top);
      case 'bottom': return Math.max(0, b.bottom - interBottom);
      case 'left':   return Math.max(0, interLeft - b.left);
      case 'right':  return Math.max(0, b.right - interRight);
    }
  }

  function visibleCenterLocal(svg: SVGSVGElement, insets: Insets) {
    const vr = getVisibleClientRect(svg, insets);
    const centerClient = { x: vr.left + vr.width/2, y: vr.top + vr.height/2 };
    const r = svg.getBoundingClientRect();
    return { cx: centerClient.x - r.left, cy: centerClient.y - r.top }; // LOCAL to svg element, CSS px
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

  function fitToScreen() {
    if (!svgElement || !layoutData?.nodes?.length) return;
    const rect = svgElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // Wait for valid dimensions
    
    const t = getFitTransform(layoutData.nodes, layoutData.edges, rect.width, rect.height, insets, 24);
    panX = t.x;
    panY = t.y;
    scale = t.scale;
  }



  function onWheel(e: WheelEvent) {
    if (!svgElement) return;
    e.preventDefault();
    hasInteracted = true;
    const { cx, cy } = visibleCenterLocal(svgElement, insets);
    const factor = Math.exp(-(e.deltaY) * 0.0015);
    smoothZoomTo(cx, cy, factor);
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
        const rect = svgElement.getBoundingClientRect();
        const cx = (a.x + b.x)/2 - rect.left;
        const cy = (a.y + b.y)/2 - rect.top;
        smoothZoomTo(cx, cy, distNow / distPrev);
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

  // Exported methods for toolbar
  export function zoomIn() { 
    if (!svgElement) return;
    hasInteracted = true; 
    const { cx, cy } = visibleCenterLocal(svgElement, insets);
    smoothZoomTo(cx, cy, 1.1);
  }
  
  export function zoomOut() { 
    if (!svgElement) return;
    hasInteracted = true; 
    const { cx, cy } = visibleCenterLocal(svgElement, insets);
    smoothZoomTo(cx, cy, 1/1.1);
  }
  
  export function resetView() { 
    if (!svgElement) return;
    
    const rect = svgElement.getBoundingClientRect();
    const t = getFitTransform(layoutData.nodes, layoutData.edges, rect.width, rect.height, insets, 24);
    
    // Use smooth animation to reset view
    smoothZoomTo(0, 0, 1, t.x, t.y, t.scale);
    
    // Reset interaction state after animation completes
    setTimeout(() => {
      hasInteracted = false;
      initialFitDone = true; // Prevent reactive auto-fit from triggering
    }, 300); // Match animation duration
  }

  // Smooth zoom animation function
  function smoothZoomTo(cx: number, cy: number, factor: number, targetX?: number, targetY?: number, targetScale?: number) {
    const startPanX = panX;
    const startPanY = panY;
    const startScale = scale;
    
    let targetPanX: number, targetPanY: number, targetScaleFinal: number;
    
    if (targetX !== undefined && targetY !== undefined && targetScale !== undefined) {
      // For reset view
      targetPanX = targetX;
      targetPanY = targetY;
      targetScaleFinal = targetScale;
    } else {
      // For zoom in/out
      const newScale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale * factor));
      const k = newScale / scale;
      targetPanX = cx - k * (cx - panX);
      targetPanY = cy - k * (cy - panY);
      targetScaleFinal = newScale;
    }
    
    const duration = 300; // 300ms animation
    const startTime = performance.now();
    
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      panX = startPanX + (targetPanX - startPanX) * easeProgress;
      panY = startPanY + (targetPanY - startPanY) * easeProgress;
      scale = startScale + (targetScaleFinal - startScale) * easeProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }



  onMount(() => {
    // Measure insets after DOM is ready
    setTimeout(() => {
      if (svgElement) {
        const toolbarEl = document.querySelector('[data-toolbar]') as HTMLElement;
        const promptBarEl = document.getElementById('prompt-bar') as HTMLElement;
        const svgRect = svgElement.getBoundingClientRect();
        insets = {
          top: 0,
          right: measureInsetFrom(toolbarEl, svgElement, 'right'),
          bottom: measureInsetFrom(promptBarEl, svgElement, 'bottom'),
          left: 0
        };
        insetsReady = true;
        
        // If we already have data, trigger the reactive fit
        if (layoutData?.nodes?.length && !hasInteracted) {
          // The reactive statement will handle the fit
        } else {
          // No data yet, just make SVG ready
          svgReady = true;
        }
      } else {
        // Fallback: make SVG ready even if insets measurement fails
        svgReady = true;
      }
    }, 100);

    // Add event listeners for zoom and pan
    if (svgElement) {
      svgElement.addEventListener('wheel', onWheel, { passive: false });
      svgElement.addEventListener('pointerdown', onPointerDown);
      svgElement.addEventListener('pointermove', onPointerMove);
      svgElement.addEventListener('pointerup', onPointerUp);
    }
  });

  onDestroy(() => {
    if (svgElement) {
      svgElement.removeEventListener('wheel', onWheel);
      svgElement.removeEventListener('pointerdown', onPointerDown);
      svgElement.removeEventListener('pointermove', onPointerMove);
      svgElement.removeEventListener('pointerup', onPointerUp);
    }
  });
</script>

  <svg 
    bind:this={svgElement}
    class="w-full h-full transition-opacity duration-150"
    class:opacity-0={!svgReady}
    style="overscroll-behavior: contain"
  >
    <g id="diagram" bind:this={diagramGroup} transform={`translate(${panX},${panY}) scale(${scale})`}>
      <!-- Transparent hit-rect so gestures always hit the group -->
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      
      <Defs />
      <EdgesLayer edges={layoutData.edges} nodes={layoutData.nodes} />
      <NodesLayer nodes={layoutData.nodes} />
    </g>
  </svg>
