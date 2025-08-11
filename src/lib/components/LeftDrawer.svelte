<script lang="ts">
  import { onMount } from 'svelte';
  import { drawerOpen } from '$lib/stores/drawerStore';
  import { promptHistory } from '$lib/stores/promptHistory';
  import { promptInput } from '$lib/stores/promptInput';

  export let examplePrompts: string[] = [
    'Generate an app with login, dashboard, and settings',
    'E-commerce with product list, cart, checkout',
    'SaaS billing dashboard with charts and filters'
  ];

  onMount(() => promptHistory.init());

  function close() { drawerOpen.close(); }
  function usePrompt(text: string) {
    promptInput.set(text);
    drawerOpen.close();
  }
</script>

<!-- Backdrop -->
{#if $drawerOpen}
  <div
    class="fixed inset-0 z-[60] bg-black/40 transition-opacity"
    onclick={close}
    aria-hidden="true"
  ></div>
{/if}

<!-- Drawer panel -->
<div
  class="fixed inset-y-0 left-0 z-[61] w-[min(88vw,20rem)] translate-x-[-100%] bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/10 dark:ring-white/10
         transition-transform duration-300 ease-out
         data-open:translate-x-0"
  data-open={$drawerOpen ? '' : undefined}
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-title"
>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
      <h2 id="drawer-title" class="text-sm font-semibold text-gray-900 dark:text-gray-100">Library</h2>
      <button
        type="button"
        class="rounded-md p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
        onclick={close}
        aria-label="Close drawer"
      >
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-6">
      <!-- Past Prompts -->
      <section>
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Past prompts</h3>
        {#if $promptHistory.length === 0}
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">No prompts yet.</p>
        {:else}
          <ul class="mt-2 space-y-2">
            {#each $promptHistory.slice(0,12) as item}
              <li class="group rounded-md border border-transparent hover:border-black/10 dark:hover:border-white/10 p-2">
                <div class="flex gap-2">
                  <button
                    class="flex-1 text-left text-sm text-gray-800 dark:text-gray-200 line-clamp-2"
                    onclick={() => usePrompt(item.text)}
                    title="Use this prompt"
                  >{item.text}</button>
                  <button
                    class="shrink-0 px-2 text-xs text-gray-500 hover:text-rose-600"
                    onclick={() => promptHistory.remove(item.id)}
                    aria-label="Remove"
                  >Remove</button>
                </div>
                <div class="mt-1 text-[11px] text-gray-400">{new Date(item.ts).toLocaleString()}</div>
              </li>
            {/each}
          </ul>
        {/if}
        <div class="mt-2 flex gap-2">
          <button class="rounded-md px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200" onclick={() => promptHistory.clear()}>Clear all</button>
        </div>
      </section>

      <!-- Example Prompts -->
      <section>
        <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Example prompts</h3>
        <ul class="mt-2 space-y-2">
          {#each examplePrompts as ex}
            <li>
              <button
                class="w-full rounded-md border border-black/10 dark:border-white/10 px-2 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onclick={() => usePrompt(ex)}
              >{ex}</button>
            </li>
          {/each}
        </ul>
      </section>
    </div>

    <!-- Footer (optional actions) -->
    <div class="px-4 py-3 border-t border-black/10 dark:border-white/10">
      <button
        class="w-full rounded-md bg-emerald-600 text-white text-sm font-medium px-3 py-2 hover:bg-emerald-700"
        onclick={close}
      >Close</button>
    </div>
  </div>
</div>

<!-- ESC to close -->
<svelte:window on:keydown={(e) => { if (e.key === 'Escape') close(); }} />

<style>
  /* utility attribute -> class toggle for transform */
  [data-open] { transform: translateX(0) !important; }
</style>
