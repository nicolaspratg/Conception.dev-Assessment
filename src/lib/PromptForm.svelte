<script lang="ts">
  import { diagramStore } from './stores/diagramStore.js';
  
  let prompt = '';
  let isGenerating = false;
  let error = '';

  async function handleSubmit() {
    if (!prompt.trim()) {
      error = 'Please enter a prompt';
      return;
    }

    isGenerating = true;
    error = '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const diagramData = await response.json();
      diagramStore.set(diagramData);
      
      // Show success message
      error = '';
      prompt = ''; // Clear the form
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isGenerating = false;
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Generate Diagram</h2>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="prompt" class="block text-sm font-medium text-gray-700 mb-2">
        Describe your application architecture:
      </label>
      <textarea
        id="prompt"
        bind:value={prompt}
        placeholder="e.g., 'A web app with a React frontend, Node.js API, and PostgreSQL database'"
        class="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isGenerating}
      />
    </div>

    {#if error}
      <div class="text-red-600 text-sm">{error}</div>
    {:else if !isGenerating && prompt === ''}
      <div class="text-green-600 text-sm">✅ Diagram generated successfully!</div>
    {/if}

    <button
      type="submit"
      disabled={isGenerating || !prompt.trim()}
      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? 'Generating...' : 'Generate Diagram'}
    </button>
  </form>
</div> 