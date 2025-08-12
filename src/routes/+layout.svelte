<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import PromptBar from '$lib/PromptBar.svelte';
	import HelpDrawer from '$lib/HelpDrawer.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { bottomInset } from '$lib/stores/viewport';
	import { onMount } from 'svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Drawer from '$lib/drawer/Drawer.svelte';
	import LibraryContent from '$lib/drawer/LibraryContent.svelte';


	let { children } = $props();
	
	let isMobile = $state(false);
	const mq = '(min-width: 640px)';

	function updateMQ() {
		isMobile = !window.matchMedia(mq).matches; // mobile if < 640px
	}

	onMount(() => {
		themeStore.init();
		updateMQ();
		const mql = window.matchMedia(mq);
		mql.addEventListener('change', updateMQ);
		return () => mql.removeEventListener('change', updateMQ);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Conception.dev — Mock-up Generator</title>
	<meta name="og:title" content="Conception.dev — Mock-up Generator" />
	<meta name="description" content="Describe your app architecture and instantly get a clean diagram." />
</svelte:head>

<div class="h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-[#343541] border-b border-gray-200 dark:border-gray-700 print:hidden">
		<div class="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
			<!-- Title -->
			<div class="flex items-center gap-3">
				<h1 class="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
					Conception.dev <span class="text-gray-400">—</span> <span class="whitespace-nowrap">Mock-up Generator</span>
				</h1>
				<span class="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
					beta
				</span>
			</div>

			<!-- Right controls -->
			<div class="flex items-center gap-2">
				<ThemeToggle />
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<div id="diagram-root" class="relative flex-1 overflow-hidden">
		{@render children?.()}
	</div>

	<!-- Mobile: fixed + VisualViewport; Desktop: absolute inside canvas -->
	<div
		id="prompt-bar"
		class="fixed inset-x-0 z-50 px-4 sm:absolute sm:inset-x-0 sm:bottom-6 sm:flex sm:justify-center"
		style:bottom={isMobile ? `${$bottomInset + 14}px` : undefined}
	>
		<div class="pointer-events-auto w-[min(640px,92vw)] sm:w-[min(640px,92%)] sm:mx-auto">
			<PromptBar />
		</div>
	</div>

	<!-- Help Drawer -->
	<HelpDrawer />
	
	<!-- Library Drawer -->
	<Drawer>
		<LibraryContent />
	</Drawer>

	<!-- Watermark (bottom-right) -->
	<div
		class="fixed right-[calc(env(safe-area-inset-right,0px)+12px)] bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-10 pointer-events-none select-none text-[11px] sm:text-xs text-gray-500/50 dark:text-gray-400/40 print:hidden"
		aria-hidden="true"
	>
		© 2025 Nicolás de Prat Gay
	</div>
</div>
