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
	<div class="flex-1 relative overflow-hidden">
		{@render children?.()}
		<PromptBar />
	</div>
</div>
