<script lang="ts">
  import { onMount } from 'svelte';
  import { drawerOpen } from '../stores/drawerStore';

  let panelEl: HTMLElement;
  let panelW = 320;                 // measured on mount / resize
  const tabPeek = 0;                // visible px of panel when closed (0 = completely hidden)
  const tabWidth = 32;              // MUST match tab button width (w-8 = 32px)
  const tabOffset = 10;             // how far the tab overlaps the panel when open (to "bite" into it)

  // Wrapper translation: pulls panel offscreen leaving only tabPeek
  $: tx = $drawerOpen ? 0 : (-panelW + tabPeek);

  // CLOSED positioning: make the tab's left edge end at viewport x=0 after translate
  // Wrapper at closed is (-panelW + tabPeek); tab left inside wrapper = (panelW - tabPeek)
  // => viewport left = (-panelW + tabPeek) + (panelW - tabPeek) = 0
  $: tabLeftClosed = `${Math.max(0, panelW - tabPeek)}px`;
  


  function open()  { drawerOpen.set(true); }
  function close() { drawerOpen.set(false); }
  function toggle(){ drawerOpen.update(v => !v); }

  let ro: ResizeObserver | null = null;
  onMount(() => {
    if (panelEl) {
      panelW = panelEl.clientWidth;
      ro = new ResizeObserver(() => { panelW = panelEl.clientWidth; });
      ro.observe(panelEl);
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onEsc);
    return () => { window.removeEventListener('keydown', onEsc); ro?.disconnect(); };
  });
</script>

<!-- Backdrop -->
{#if $drawerOpen}
  <button
    type="button"
    class="fixed inset-0 z-[69] bg-black/40 transition-opacity"
    aria-label="Close drawer"
    on:click={close}
  ></button>
{/if}

<!-- Wrapper: moves panel & tab together -->
<div
  class="fixed left-0 top-12 h-[calc(100%-3rem)] z-[70] will-change-transform"
  style="transform: translate3d({tx}px,0,0); transition: transform 220ms cubic-bezier(0.22,1,0.36,1);"
>
  <!-- Panel -->
  <aside
    bind:this={panelEl}
    class="relative h-[100dvh] max-w-md w-full bg-white dark:bg-gray-900 shadow-xl grid grid-rows-[auto_1fr_auto] overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
  >
    <!-- Header (sticky look) -->
    <div class="sticky top-0 z-10 border-b border-gray-200/70 bg-white/90 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-gray-900/90">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Library</h2>
        <button
          type="button"
          class="grid size-8 place-items-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
          aria-label="Close"
          on:click={close}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
        </button>
      </div>
    </div>

    <!-- Row 2: content area with isolated scroll only for Past prompts -->
    <div class="min-h-0 overflow-hidden px-5 pt-4 pb-3">
      <slot />
    </div>

    <!-- Footer -->
    <div class="sticky bottom-0 z-10 border-t border-gray-200/70 bg-white/90 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-gray-900/90">
      <button
        type="button"
        class="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        on:click={close}
      >
        Close
      </button>
    </div>
  </aside>

  <!-- Chevron Tab -->
  <button
    type="button"
    on:click={toggle}
    aria-label={$drawerOpen ? 'Close library' : 'Open library'}
    class="absolute top-1/2 -translate-y-1/2 h-14 w-8 rounded-r-lg
           bg-white/95 dark:bg-gray-800/95 ring-1 ring-black/5 dark:ring-white/10
           shadow-[3px_0_10px_rgba(0,0,0,0.12)]
           flex items-center justify-center select-none
           will-change-transform"
    style={$drawerOpen
      ? `left:${panelW - tabOffset}px`
      : `left:${tabLeftClosed}`
    }
    class:tab-tease={!$drawerOpen}
  >
    <svg viewBox="0 0 20 20" fill="none"
         class="h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform duration-200"
         class:rotate-180={$drawerOpen}
    >
      <path d="M7.5 4.5 12 10l-4.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</div>

<style>
  /* Tease ONLY the tab, never creating a gap with the edge.
     We scale from the LEFT, so the left edge stays glued to x=0. */
  @keyframes tab-tease-scale {
    0%   { transform: translateY(-50%) scaleX(1); }
    50%  { transform: translateY(-50%) scaleX(1.06); }
    100% { transform: translateY(-50%) scaleX(1); }
  }
  .tab-tease {
    transform-origin: left center;
    animation: tab-tease-scale 2.2s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .tab-tease { animation: none; }
  }
</style>
