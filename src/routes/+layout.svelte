<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import PromptBar from '$lib/PromptBar.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { onMount } from 'svelte';

	let { children } = $props();
	
	onMount(() => {
		themeStore.init();
	});
	
	// Reactive statement to update the dark class when theme changes
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle("dark", $themeStore);
		}
	});
	
	function toggleDarkMode() {
		themeStore.toggle();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-screen flex flex-col">
	<!-- Title Bar -->
	<header class="h-12 bg-white dark:bg-[#343541] border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between z-40">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
			Conception.dev Mock-up Generator
		</h1>
		<button 
			onclick={toggleDarkMode}
			class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
			aria-label="Toggle dark mode"
		>
			{$themeStore ? '☀️' : '🌙'}
		</button>
	</header>

	<!-- Main Content Area -->
	<div id="diagram-root" class="relative flex-1 overflow-hidden">
		{@render children?.()}
		<!-- PromptBar positioning -->
		<div
			id="prompt-bar"
			class="pointer-events-none z-50 absolute inset-x-0 bottom-6 flex justify-center md:bottom-6 sm:fixed sm:left-1/2 sm:-translate-x-1/2 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+14px)] sm:px-4"
		>
			<div class="pointer-events-auto w-[min(640px,92%)] sm:w-[min(640px,92vw)]">
				<PromptBar />
			</div>
		</div>
	</div>
</div>
