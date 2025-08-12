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

<!-- Past Prompts -->
<section class="mb-6">
  <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Past prompts</h3>
  {#if $promptHistory.length === 0}
    <p class="text-sm text-gray-500 dark:text-gray-400">No prompts yet.</p>
  {:else}
    <ul class="space-y-2">
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
  <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Example prompts</h3>
  <div class="space-y-2">
    {#each examplePrompts as ex}
      <button 
        class="w-full text-left p-2 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        onclick={() => usePrompt(ex)}
      >
        {ex}
      </button>
    {/each}
  </div>
</section>
