<script lang="ts">
  import { onMount } from 'svelte';
  
  let requestLog = $state<Array<{timestamp: number; prompt: string; success: boolean}>>([]);
  let isVisible = $state(false);
  
  // Toggle visibility with Ctrl+Shift+D
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        isVisible = !isVisible;
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
  
  // Function to log requests (called from PromptBar)
  export function logRequest(prompt: string, success: boolean) {
    requestLog = [
      { timestamp: Date.now(), prompt, success },
      ...requestLog.slice(0, 9) // Keep last 10 requests
    ];
  }
  
  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString();
  }
  
  function getTimeSince(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    return `${seconds}s ago`;
  }
  
  function getRateLimitStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestLog.filter(req => req.timestamp > oneMinuteAgo);
    
    return {
      count: recentRequests.length,
      limit: 2,
      remaining: Math.max(0, 2 - recentRequests.length),
      nextReset: recentRequests.length > 0 ? new Date(recentRequests[0].timestamp + 60000).toLocaleTimeString() : 'N/A'
    };
  }
  
  const status = getRateLimitStatus();
</script>

{#if isVisible}
  <div class="fixed top-16 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Rate Limit Debug</h3>
      <button 
        onclick={() => isVisible = false}
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ✕
      </button>
    </div>
    
    <!-- Current Status -->
    <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
      <div class="text-xs text-gray-600 dark:text-gray-300 mb-2">Current Status</div>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>Requests: <span class="font-mono">{status.count}/2</span></div>
        <div>Remaining: <span class="font-mono">{status.remaining}</span></div>
        <div>Next Reset: <span class="font-mono text-xs">{status.nextReset}</span></div>
      </div>
    </div>
    
    <!-- Request Log -->
    <div class="mb-3">
      <div class="text-xs text-gray-600 dark:text-gray-300 mb-2">Recent Requests</div>
      {#if requestLog.length === 0}
        <div class="text-xs text-gray-500 dark:text-gray-400">No requests logged yet</div>
      {:else}
        <div class="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
          {#each requestLog as req}
            <div class="text-xs p-2 rounded {req.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full {req.success ? 'bg-green-500' : 'bg-red-500'}"></span>
                <span class="font-mono">{formatTime(req.timestamp)}</span>
                <span class="text-gray-500">({getTimeSince(req.timestamp)})</span>
              </div>
              <div class="mt-1 text-gray-700 dark:text-gray-300 truncate" title={req.prompt}>
                {req.prompt}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Instructions -->
    <div class="text-xs text-gray-500 dark:text-gray-400">
      Press <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl+Shift+D</kbd> to toggle
    </div>
  </div>
{/if}
