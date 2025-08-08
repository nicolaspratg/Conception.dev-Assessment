<script lang="ts">
	import { diagramStore } from './stores/diagramStore.js';
	import { diagramApi } from './api/client/diagramApi.js';
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let prompt = $state('');
	let isGenerating = $state(false);
	let showToast = $state(false);
	let textareaEl: HTMLTextAreaElement;

	// Auto-resize textarea
	$effect(() => {
		if (textareaEl && prompt) {
			textareaEl.style.height = 'auto';
			textareaEl.style.height = Math.min(textareaEl.scrollHeight, 160) + 'px'; // up to 6 lines
		}
	});

	async function handleSubmit() {
		const text = prompt.trim();
		if (!text) {
			return;
		}

		if (isGenerating) {
			return; // Prevent multiple simultaneous requests
		}

		isGenerating = true;

		try {
			console.log('Generating diagram for prompt:', text);
			const diagramData = await diagramApi.generateDiagram({ prompt: text });
			console.log('Received diagram data:', diagramData);
			diagramStore.set(diagramData);
			
			// Show success message
			prompt = ''; // Clear the form
			showToast = true;
			setTimeout(() => (showToast = false), 3000);
		} catch (err) {
			console.error('Error generating diagram:', err);
			// Don't clear the prompt on error so user can try again
		} finally {
			isGenerating = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<!-- Outer anchor keeps bar centred and visible -->
<div class="absolute inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none">
	<div class="pointer-events-auto w-[min(640px,90%)] bg-white/70 dark:bg-gray-900/70
				backdrop-blur rounded-xl px-4 py-3 flex gap-2 border border-gray-200 dark:border-gray-700">
		<textarea
			bind:this={textareaEl}
			bind:value={prompt}
			onkeydown={handleKey}
			rows="2"
			placeholder="Describe your application architecture…"
			class="flex-1 resize-none overflow-y-auto bg-transparent text-gray-900 dark:text-gray-200
				   placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[56px] max-h-[160px]"
		></textarea>

		<button
			onclick={handleSubmit}
			class="w-14 h-14 flex items-center justify-center bg-emerald-600
				   hover:bg-emerald-500 rounded-lg text-2xl disabled:opacity-50"
			disabled={isGenerating}
			aria-label="Generate"
		>
			{#if isGenerating}
				<svg class="animate-spin w-5 h-5" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10"
							stroke="currentColor" stroke-width="4" fill="none"/>
				</svg>
			{:else}
				🡅
			{/if}
		</button>
	</div>
</div>

{#if showToast}
	<div class="fixed bottom-24 right-6 bg-emerald-600 text-white
			   px-3 py-2 rounded shadow z-50 animate-fade-in">
		Diagram generated successfully!
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style> 