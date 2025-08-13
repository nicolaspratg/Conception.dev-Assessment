<script lang="ts">
	import { diagramStore } from './stores/diagramStore.js';
	import { diagramApi } from './api/client/diagramApi.js';
	import { createEventDispatcher, tick } from 'svelte';
	import { promptHistory } from './stores/promptHistory.js';
	import { promptInput } from './stores/promptInput.js';
	import RateLimitDebug from './components/RateLimitDebug.svelte';
	import Spinner from './components/Spinner.svelte';
	import { genMode, setGenMode } from './stores/modeStore';
	
	const dispatch = createEventDispatcher();
	
	let prompt = $state('');
	let loading = $state(false);
	let showToast = $state(false);
	let textarea: HTMLTextAreaElement;
	let debugComponent: RateLimitDebug;
	
	// Keep prompt in sync with the shared store
	$effect(() => {
		promptInput.set(prompt);
	});
	
	// Listen for changes from the drawer
	$effect(() => {
		const drawerPrompt = $promptInput;
		if (drawerPrompt && drawerPrompt !== prompt) {
			prompt = drawerPrompt;
		}
	});

	// Auto-resize textarea
	$effect(() => {
		if (textarea) {
			textarea.style.height = 'auto';
			if (prompt) {
				textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'; // up to 6 lines
			} else {
				// Reset to minimum height when prompt is empty
				textarea.style.height = '56px'; // min-h-[56px]
			}
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
			const diagramData = await diagramApi.generateDiagram({ 
				prompt: text, 
				preferMulti: $genMode === 'smart'
			});
			console.log('Received diagram data:', diagramData);
			
			// Handle both legacy and intel planner responses
			if (diagramData.diagrams && diagramData.meta) {
				// Intel planner response - use first diagram
				diagramStore.set(diagramData.diagrams[0]);
				console.log('Intel planner rationale:', diagramData.meta[0].rationale);
			} else if (diagramData.nodes && diagramData.edges) {
				// Legacy response
				diagramStore.set({ nodes: diagramData.nodes, edges: diagramData.edges });
			} else {
				throw new Error('Invalid response format');
			}
			
			// Save to history after successful generation
			promptHistory.add(text);
			
			// Log successful request
			debugComponent?.logRequest(text, true);
			
			// Show success message
			prompt = ''; // Clear the form
			showToast = true;
			setTimeout(() => (showToast = false), 3000);
		} catch (err) {
			console.error('Error generating diagram:', err);
			// Log failed request
			debugComponent?.logRequest(text, false);
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

<!-- The positioning is now handled by the parent layout -->
<div class="bg-white/70 dark:bg-gray-900/70 backdrop-blur rounded-xl px-4 py-3 flex gap-2 border border-gray-200 dark:border-gray-700 items-center">
		<textarea
			bind:this={textarea}
			bind:value={prompt}
			onkeydown={handleKey}
			rows="2"
			placeholder="Describe your application architecture…"
			disabled={loading}
			class="flex-1 resize-none overflow-y-auto bg-transparent text-gray-900 dark:text-gray-200
				   placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[56px] max-h-[160px]
				   disabled:opacity-50 scrollbar-thin"
		></textarea>

		<button
			onclick={submit}
			class="w-14 h-14 flex items-center justify-center bg-emerald-600
				   hover:bg-emerald-500 rounded-lg disabled:opacity-50 transition-colors"
			disabled={loading}
			aria-label="Generate"
		>
			{#if loading}
				<Spinner size={20} className="text-white" />
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
				</svg>
			{/if}
		</button>
		
		<!-- Mode Toggle -->
		<button
			type="button"
			class="w-14 h-14 flex flex-col items-center justify-center text-xs rounded-lg transition-colors border self-center {$genMode === 'smart'
				? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300' 
				: 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'}"
			onclick={() => {
				console.log('Mode toggle clicked, current mode:', $genMode);
				setGenMode($genMode === 'smart' ? 'legacy' : 'smart');
			}}
			title={$genMode === 'smart' ? 'Switch to Legacy Mode' : 'Switch to Intelligent Mode'}
		>
			{#if $genMode === 'smart'}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mb-1">
					<path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
				</svg>
			{/if}
			{$genMode === 'smart' ? 'Smart' : 'Legacy'}
		</button>
</div>

{#if showToast}
	<div class="fixed bottom-24 right-6 bg-emerald-600 text-white
			   px-3 py-2 rounded shadow z-50 animate-fade-in">
		Diagram generated successfully!
	</div>
{/if}

<!-- Rate Limit Debug Component -->
<RateLimitDebug bind:this={debugComponent} />

<!-- Accessibility: Live region for loading state -->
<div class="sr-only" aria-live="polite">
	{#if loading}Generating…{/if}
</div>

<style>
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style> 