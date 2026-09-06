<script lang="ts">
  import { onMount } from 'svelte';
  import { clickOutside } from '../actions/clickOutside';
  import type { Node, Edge } from '../types/diagram';

  export let node: Node;
  export let edges: Edge[] = [];
  export let nodes: Node[] = [];
  export let onClose: () => void;
  export let onFocusNode: (id: string) => void;

  const TYPE_LABEL: Record<Node['type'], string> = {
    component: 'Component',
    external: 'External API',
    datastore: 'Data store',
    custom: 'Custom'
  };

  const TYPE_BADGE_CLASS: Record<Node['type'], string> = {
    component: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200',
    external: 'bg-sky-100 text-sky-700 dark:bg-sky-800/60 dark:text-sky-200',
    datastore: 'bg-amber-100 text-amber-700 dark:bg-amber-800/60 dark:text-amber-200',
    custom: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-800/60 dark:text-cyan-200'
  };

  function labelFor(id: string) {
    return nodes.find((n) => n.id === id)?.label ?? id;
  }

  $: incoming = edges.filter((e) => e.target === node.id);
  $: outgoing = edges.filter((e) => e.source === node.id);

  onMount(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  });
</script>

<aside
  use:clickOutside={onClose}
  class="fixed right-3 top-24 z-[55] w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-7rem)]
         overflow-y-auto rounded-lg bg-white/95 dark:bg-gray-900/95 shadow-xl
         ring-1 ring-black/5 dark:ring-white/10 backdrop-blur"
>
  <div class="flex items-start justify-between gap-3 px-4 pt-4">
    <div class="min-w-0">
      <span class="inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide {TYPE_BADGE_CLASS[node.type]}">
        {TYPE_LABEL[node.type]}
      </span>
      <h2 class="mt-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{node.label}</h2>
      <p class="text-xs text-gray-400 dark:text-gray-500 font-mono">{node.id}</p>
    </div>
    <button
      type="button"
      class="grid size-7 shrink-0 place-items-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
      aria-label="Close details"
      on:click={onClose}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
    </button>
  </div>

  <div class="mt-3 px-4 pb-4 space-y-4">
    <div>
      <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Incoming ({incoming.length})
      </h3>
      {#if incoming.length === 0}
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">None</p>
      {:else}
        <ul class="mt-1 space-y-1">
          {#each incoming as e (e.id)}
            <li>
              <button
                type="button"
                class="w-full text-left rounded px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/5"
                on:click={() => onFocusNode(e.source)}
              >
                <span class="font-medium text-gray-700 dark:text-gray-200">{labelFor(e.source)}</span>
                {#if e.label}<span class="text-gray-400 dark:text-gray-500"> — {e.label}</span>{/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div>
      <h3 class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Outgoing ({outgoing.length})
      </h3>
      {#if outgoing.length === 0}
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">None</p>
      {:else}
        <ul class="mt-1 space-y-1">
          {#each outgoing as e (e.id)}
            <li>
              <button
                type="button"
                class="w-full text-left rounded px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/5"
                on:click={() => onFocusNode(e.target)}
              >
                <span class="font-medium text-gray-700 dark:text-gray-200">{labelFor(e.target)}</span>
                {#if e.label}<span class="text-gray-400 dark:text-gray-500"> — {e.label}</span>{/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</aside>
