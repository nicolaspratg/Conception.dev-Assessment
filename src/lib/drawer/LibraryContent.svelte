<script lang="ts">
  import { onMount } from 'svelte';
  import { drawerOpen } from '../stores/drawerStore';
  import { promptHistory } from '../stores/promptHistory';
  import { promptInput } from '../stores/promptInput';

  export let examplePrompts: string[] = [
    'Create a language learning web app using Next.js, Python Flask, and PostgreSQL',
    'Mock up a recipe sharing site using SvelteKit, Supabase, and Tailwind CSS.',
    'Create a social networking site using React, GraphQL, and MongoDB.'
  ];

  onMount(() => promptHistory.init());

  function usePrompt(text: string) {
    promptInput.set(text);
    drawerOpen.set(false);
  }
</script>

<div class="flex min-h-0 flex-col gap-6 h-full">
  <!-- PAST PROMPTS (this section scrolls) -->
  <section class="min-h-0 flex-1 flex flex-col">
    <div class="flex items-center justify-between mb-2 shrink-0">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Past prompts
      </h3>
      <button 
        class="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15"
        onclick={() => promptHistory.clear()}
      >
        Clear all
      </button>
    </div>

    <!-- The ONLY scroll container -->
    <div class="scroll-sleek min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
      {#if $promptHistory.length === 0}
        <p class="text-sm text-gray-500 dark:text-gray-400">No prompts yet.</p>
      {:else}
        <ul class="space-y-3">
          {#each $promptHistory.slice(0,12) as item}
            <li class="relative">
              <button 
                class="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-white/5 pr-10"
                onclick={() => usePrompt(item.text)}
              >
                {item.text}
              </button>
              <button 
                class="absolute right-2 top-1/2 -translate-y-1/2 text-rose-600 hover:text-rose-500" 
                onclick={() => promptHistory.remove(item.id)}
                aria-label="Remove prompt"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- EXAMPLE PROMPTS (non-scrolling) -->
  <section class="shrink-0">
    <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      Example prompts
    </h3>
    <div class="space-y-3">
      {#each examplePrompts as ex}
        <button 
          class="w-full rounded-lg border border-gray-200/70 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-white/5"
          onclick={() => usePrompt(ex)}
        >
          {ex}
        </button>
      {/each}
    </div>
  </section>
</div>
