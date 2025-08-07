<script lang="ts">
  import Diagram from '$lib/Diagram.svelte';
  import PromptForm from '$lib/PromptForm.svelte';
</script>

<svelte:head>
  <title>Diagram Playground - Visual Mock-up Generator</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
    <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Diagram Playground</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Visual Mock-up Generator - Conception.dev Assessment</p>
  </header>
  
  <main class="flex-1 overflow-auto">
    <div class="max-w-4xl mx-auto p-4 sm:p-6">
      <PromptForm />
      <Diagram />
    </div>
  </main>
</div> 