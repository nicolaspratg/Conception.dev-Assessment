<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import PromptBar from '$lib/PromptBar.svelte';
	import { onMount } from 'svelte';


	let { children } = $props();
	
	let isDark = $state(false);
	
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
			onclick={toggleDarkMode}
			class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
			aria-label="Toggle dark mode"
		>
			{isDark ? '☀️' : '🌙'}
		</button>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 pt-12 overflow-hidden">
		{@render children?.()}
	</main>

	<!-- Floating Prompt Bar -->
	<div class="pointer-events-none fixed inset-0 flex items-end justify-center pb-6">
		<PromptBar class="pointer-events-auto w-[min(640px,90%)]" />
	</div>
</div>
