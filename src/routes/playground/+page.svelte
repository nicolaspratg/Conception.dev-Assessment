<script lang="ts">
  import Diagram from '$lib/Diagram.svelte';
</script>

<svelte:head>
  <title>Diagram Playground - Visual Mock-up Generator</title>
</svelte:head>

<div class="h-screen flex flex-col">
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <h1 class="text-2xl font-bold text-gray-900">Diagram Playground</h1>
    <p class="text-gray-600 mt-1">Visual Mock-up Generator - Conception.dev Assessment</p>
  </header>
  
  <main class="flex-1">
    <Diagram />
  </main>
</div> 