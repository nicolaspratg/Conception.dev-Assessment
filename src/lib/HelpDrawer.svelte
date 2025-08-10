<script lang="ts">
  import { helpOpen } from './stores/helpStore';

  function closeHelp() {
    helpOpen.set(false);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closeHelp();
  }
</script>

{#if $helpOpen}
  <!-- Backdrop + dialog container (no interactive handlers on divs) -->
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-title"
  >
    <!-- Clickable backdrop uses a real button (not self-closing) -->
    <button
      type="button"
      class="absolute inset-0 w-full h-full bg-black/50"
      aria-label="Close help dialog"
      on:click={closeHelp}
    ></button>

    <!-- Dialog panel: no click/keydown handlers on this div -->
    <div
      class="relative z-10 max-w-md w-full rounded-lg shadow-xl bg-white dark:bg-gray-800 p-6"
      role="document"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 id="help-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Help
        </h2>
        <button
          type="button"
          on:click={closeHelp}
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="space-y-4 text-gray-700 dark:text-gray-300">
        <section>
          <h3 class="font-semibold mb-2">Navigation</h3>
          <ul class="space-y-1 text-sm">
            <li><strong>Mouse/Touch:</strong> Drag to pan, scroll to zoom</li>
            <li><strong>Pinch:</strong> Two-finger pinch to zoom on mobile</li>
            <li><strong>+/- Buttons:</strong> Zoom in/out centered on viewport</li>
            <li><strong>Reset (⤾):</strong> Return to initial centered view</li>
          </ul>
        </section>

        <section>
          <h3 class="font-semibold mb-2">Diagram Elements</h3>
          <ul class="space-y-1 text-sm">
            <li><strong>Rectangles:</strong> Components/Services</li>
            <li><strong>Circles:</strong> External APIs</li>
            <li><strong>Cylinders:</strong> Data stores</li>
            <li><strong>Arrows:</strong> Data flow between elements</li>
          </ul>
        </section>
      </div>
    </div>
  </div>

{/if}

<!-- Global key handler (Escape to close) -->
<svelte:window on:keydown={$helpOpen ? handleKeydown : undefined} />
