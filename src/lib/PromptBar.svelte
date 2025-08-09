<script lang="ts">
	import { diagramStore } from './stores/diagramStore.js';
	import { diagramApi } from './api/client/diagramApi.js';
	import { createEventDispatcher, tick } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let prompt = $state('');
	let loading = $state(false);
	let showToast = $state(false);
	let textarea: HTMLTextAreaElement;

	// Auto-resize textarea
	$effect(() => {
		if (textarea && prompt) {
			textarea.style.height = 'auto';
			textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'; // up to 6 lines
		}
	});

	async function submit() {
		const text = prompt.trim();
		if (!text || loading) {
			return;
		}

		loading = true;
		await tick(); // ✨ let disabled state render now

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
			loading = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}
</script>

<!-- Outer anchor keeps bar centred and visible -->
<div class="absolute inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none">
	<div class="pointer-events-auto w-[min(640px,90%)] bg-white/70 dark:bg-gray-900/70
				backdrop-blur rounded-xl px-4 py-3 flex gap-2 border border-gray-200 dark:border-gray-700">
		<textarea
			bind:this={textarea}
			bind:value={prompt}
			onkeydown={handleKey}
			rows="2"
			placeholder="Describe your application architecture…"
			disabled={loading}
			class="flex-1 resize-none overflow-y-auto bg-transparent text-gray-900 dark:text-gray-200
				   placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[56px] max-h-[160px]
				   disabled:opacity-50"
		></textarea>

		<button
			onclick={submit}
			class="w-14 h-14 flex items-center justify-center bg-emerald-600
				   hover:bg-emerald-500 rounded-lg text-2xl disabled:opacity-50"
			disabled={loading}
			aria-label="Generate"
		>
			{#if loading}
				⏳
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