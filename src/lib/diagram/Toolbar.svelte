<script lang="ts">
  import { tooltip } from '../actions/tooltip';
  import { showHints } from '../stores/helpStore';

  export let onZoomIn: () => void;
  export let onZoomOut: () => void;
  export let onReset: () => void;
  export let onHelp: () => void;
</script>

<!-- Zoom controls -->
<div data-toolbar class="fixed right-[max(12px,env(safe-area-inset-right))] top-24 z-[54] flex flex-col gap-2">
  <button 
    class="group w-11 h-11 rounded-md bg-white/90 dark:bg-gray-800/90 border border-black/10 dark:border-white/10 shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400" 
    on:click={onZoomIn} 
    aria-label="Zoom in"
    use:tooltip={$showHints ? { content: 'Zoom in' } : undefined}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 transition-transform duration-200 group-hover:scale-110">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
    </svg>
  </button>
  <button 
    class="group w-11 h-11 rounded-md bg-white/90 dark:bg-gray-800/90 border border-black/10 dark:border-white/10 shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400" 
    on:click={onZoomOut} 
    aria-label="Zoom out"
    use:tooltip={$showHints ? { content: 'Zoom out' } : undefined}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 transition-transform duration-200 group-hover:scale-110">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
    </svg>
  </button>
  <button 
    class="group w-11 h-11 rounded-md bg-white/90 dark:bg-gray-800/90 border border-black/10 dark:border-white/10 shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400" 
    on:click={onReset} 
    aria-label="Reset view"
    use:tooltip={$showHints ? { content: 'Reset' } : undefined}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 transition-transform duration-200 group-hover:scale-110">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  </button>
  
  <!-- Help button -->
  <button
    class="group w-11 h-11 rounded-md bg-white/90 dark:bg-gray-800/90 border border-black/10 dark:border-white/10 shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
    on:click={onHelp}
    aria-label="Open help"
    use:tooltip={$showHints ? { content: 'Help' } : undefined}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 transition-transform duration-200 group-hover:scale-110">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  </button>
</div>
