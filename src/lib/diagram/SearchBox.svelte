<script lang="ts">
  export let value = '';
  export let matchCount = 0;
  export let onSubmit: () => void;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') onSubmit();
    if (e.key === 'Escape') { value = ''; (e.target as HTMLInputElement).blur(); }
  }
</script>

<div
  class="fixed left-[max(12px,env(safe-area-inset-left))] top-24 z-[54]
         flex items-center gap-2 rounded-md bg-white/90 dark:bg-gray-800/90
         border border-black/10 dark:border-white/10 shadow px-3 h-11 w-56"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
       stroke="currentColor" class="size-4 shrink-0 text-gray-400 dark:text-gray-500">
    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
  <input
    type="text"
    bind:value
    on:keydown={handleKeydown}
    placeholder="Search nodes…"
    aria-label="Search nodes"
    class="min-w-0 flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200
           placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
  />
  {#if value.trim()}
    <span class="shrink-0 text-xs tabular-nums text-gray-400 dark:text-gray-500">
      {matchCount}
    </span>
    <button
      type="button"
      aria-label="Clear search"
      class="grid size-5 shrink-0 place-items-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-white/10"
      on:click={() => (value = '')}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
    </button>
  {/if}
</div>
