<script lang="ts">
	import { diagramStore } from './stores/diagramStore.js';
	
	let prompt = '';
	let isGenerating = false;
	let error = '';
	let submitTimeout: number | null = null;

	async function handleSubmit() {
		if (!prompt.trim()) {
			error = 'Please enter a prompt';
			return;
		}

		// Debounce to prevent multiple calls on hot-reload
		if (submitTimeout) {
			clearTimeout(submitTimeout);
		}

		if (isGenerating) {
			return; // Prevent multiple simultaneous requests
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

<div class="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-[#343541]/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 z-50">
	<div class="max-w-4xl mx-auto">
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex gap-3">
			<div class="flex-1">
				<textarea
					bind:value={prompt}
					placeholder="Describe your application architecture..."
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 dark:focus:ring-emerald-400 focus:border-transparent bg-white dark:bg-[#40414f] text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
					rows="1"
					disabled={isGenerating}
				></textarea>
			</div>
			
			<button
				type="submit"
				disabled={isGenerating || !prompt.trim()}
				class="px-4 py-2 bg-sky-600 dark:bg-emerald-400 text-white dark:text-gray-900 rounded-lg hover:bg-sky-700 dark:hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-emerald-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
			>
				{isGenerating ? 'Generating...' : 'Generate'}
			</button>
		</form>
		
		{#if error}
			<div class="mt-2 text-red-600 dark:text-red-400 text-sm">{error}</div>
		{:else if !isGenerating && prompt === ''}
			<div class="mt-2 text-green-600 dark:text-green-400 text-sm">✅ Diagram generated successfully!</div>
		{/if}
	</div>
</div> 