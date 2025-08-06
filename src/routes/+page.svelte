<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    goto('/playground');
  });
</script>

<div class="flex items-center justify-center h-screen">
  <div class="text-center">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Visual Mock-up Generator</h1>
    <p class="text-gray-600">Redirecting to playground...</p>
  </div>
</div>
