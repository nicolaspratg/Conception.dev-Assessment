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
    class="btn-tool" 
    on:click={onZoomIn} 
    use:tooltip={$showHints ? { content: 'Zoom in (+)' } : undefined}
  >
    ＋
  </button>
  <button 
    class="btn-tool" 
    on:click={onZoomOut} 
    use:tooltip={$showHints ? { content: 'Zoom out (-)' } : undefined}
  >
    －
  </button>
  <button 
    class="btn-tool" 
    on:click={onReset} 
    use:tooltip={$showHints ? { content: 'Reset (R)' } : undefined}
  >
    ⤾
  </button>
  
  <!-- Help button -->
  <button
    class="btn-tool"
    on:click={onHelp}
    aria-label="Open help"
    use:tooltip={$showHints ? { content: 'Help (H)' } : undefined}
  >
    ?
  </button>
</div>

<style>
  .btn-tool { 
    @apply w-11 h-11 rounded-md bg-white/90 dark:bg-gray-800/90 border border-black/10 dark:border-white/10 shadow flex items-center justify-center text-lg text-gray-700 dark:text-gray-200; 
  }
  .btn-tool:focus { 
    @apply outline-none ring-2 ring-sky-400; 
  }
</style>
