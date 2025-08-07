<script lang="ts">
  import Diagram from '$lib/Diagram.svelte';
</script>

<svelte:head>
  <title>Diagram Playground - Visual Mock-up Generator</title>
</svelte:head>

<!-- Mock-up Container -->
<div class="h-full p-4 flex items-center justify-center">
  <div class="max-w-2xl w-full">
    <div class="bg-white dark:bg-[#343541] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <Diagram />
    </div>
  </div>
</div> 