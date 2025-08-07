<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import PromptBar from '$lib/PromptBar.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	
	let isDark = false;
	
	onMount(() => {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		document.documentElement.classList.toggle("dark", prefersDark);
		isDark = prefersDark;
	});
	
	function toggleDarkMode() {
		isDark = !isDark;
		document.documentElement.classList.toggle("dark", isDark);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-[#202123] transition-colors duration-200 flex flex-col">
	<!-- Title Bar -->
	<header class="fixed top-0 inset-x-0 h-12 bg-white dark:bg-[#343541] border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between z-40">
		<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
			Conception.dev Mock-up Generator
		</h1>
		<button 
			on:click={toggleDarkMode}
			class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
		>
			{isDark ? 'Light' : 'Dark'} Mode
		</button>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 pt-12 pb-24 overflow-hidden">
		{@render children?.()}
	</main>

	<!-- Prompt Bar -->
	<PromptBar />
</div>
