<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { helpOpen } from './stores/helpStore';
  import { clickOutside } from './actions/clickOutside';

  let panelEl: HTMLDivElement | null = null;

  function close() {
    helpOpen.set(false);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  // Optional: focus the close button for a11y when opened
  let closeBtn: HTMLButtonElement | null = null;
  $: if ($helpOpen) {
    // allow DOM to paint then focus
    queueMicrotask(() => closeBtn?.focus());
  }
</script>

<!-- Fixed, non-modal popover. No backdrop. -->
{#if $helpOpen}
  <div
    class="fixed z-[60] pointer-events-none"
    aria-live="polite"
  >
    <!-- The popover panel -->
    <div
      bind:this={panelEl}
      use:clickOutside={close}
      role="dialog"
      aria-labelledby="help-title"
      aria-modal="false"
      tabindex="-1"
      class="pointer-events-auto fixed right-24 sm:right-[84px] top-[calc(50%-120px)] w-[min(90vw,22rem)] rounded-xl border border-black/5 bg-white/95 p-4 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-gray-800/90 dark:border-white/10 dark:shadow-black/30
             transition-transform duration-150 ease-out will-change-transform"
      style="transform: translateZ(0);"
      on:keydown={onKey}
      transition:fly={{ x: 12, y: 0, duration: 160 }}
    >
      <div class="flex items-start gap-3">
        <div class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          ?
        </div>
        <div class="min-w-0">
          <h2 id="help-title" class="text-base font-semibold text-gray-900 dark:text-gray-100">
            How this page works
          </h2>
          <p class="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Type a prompt at the bottom to generate an architecture mock-up. You can pan/zoom the canvas with your mouse or the buttons on the right.
          </p>
          <p class="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Use the <strong>Smart</strong> mode for intelligent multi-level planning, or <strong>Legacy</strong> mode for simple single-diagram generation. Toggle between modes using the button next to the generate button.
          </p>
          <p class="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
            Need ideas or want to reuse something you tried? Open the left drawer to see <strong>Example prompts</strong> and your <strong>Past prompts</strong>.
          </p>
        </div>

        <!-- Close button (square hover, no pill) -->
        <button
          bind:this={closeBtn}
          type="button"
          on:click={close}
          class="inline-flex h-8 w-8 items-center justify-center rounded-md
                 text-gray-400 hover:bg-gray-950/10 hover:text-gray-700
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600
                 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Close help"
        >
          <!-- No absolute inset spans! -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               class="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>


    </div>
  </div>
{/if}

<!-- Esc handler while open -->
<svelte:window on:keydown={$helpOpen ? onKey : undefined} />
