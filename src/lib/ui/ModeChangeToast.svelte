<script lang="ts">
  import { onMount } from 'svelte';
  import type { GenMode } from '$lib/stores/modeStore';

  export let mode: GenMode = 'legacy';
  export let open = false;
  export let onClose: () => void = () => {};

  let timer: any;

  $: title = mode === 'smart' ? 'Smart mode enabled' : 'Back to legacy mode';
  $: body =
    mode === 'smart'
      ? 'Smart mode infers technologies from your description (extract → plan → render). Results are more opinionated and may take slightly longer.'
      : 'Legacy mode asks the model for diagram JSON directly. It\'s fast and literal—great when you want exact control from your prompt.';

  onMount(() => {
    if (open) timer = setTimeout(() => onClose(), 6000);
  });

  $: if (open) {
    	// console.log('Toast component: open changed to', open, 'mode:', mode);
    clearTimeout(timer);
    timer = setTimeout(() => onClose(), 6000);
  }
</script>

{#if open}
  <div
    class="pointer-events-auto fixed right-4 bottom-24 z-[70] max-w-sm rounded-lg bg-white p-4 shadow-lg border border-gray-200 transition-all duration-300 ease-in-out
           dark:bg-gray-800 dark:border-gray-700"
    role="status"
    aria-live="polite"
  >
    <div class="flex items-start gap-3">
      <div class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full
                  {mode === 'smart' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15'}">
        <!-- simple icon -->
        {#if mode === 'smart'}
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.5-9-4 4-2-2 1.06-1.06L9.5 10.94l2.94-2.94L13.5 9Z"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
            <path d="M4.5 12h15M12 4.5v15" stroke-linecap="round"/>
          </svg>
        {/if}
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
      </div>

      <button
        class="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 focus:outline-none
               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-white"
        aria-label="Close"
        on:click={onClose}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
        </svg>
      </button>
    </div>
  </div>
{/if}
