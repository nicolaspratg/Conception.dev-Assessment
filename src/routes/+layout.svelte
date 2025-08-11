<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import PromptBar from '$lib/PromptBar.svelte';
	import HelpDrawer from '$lib/HelpDrawer.svelte';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { bottomInset } from '$lib/stores/viewport';
	import { onMount } from 'svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LeftDrawer from '$lib/components/LeftDrawer.svelte';
	import { drawerOpen } from '$lib/stores/drawerStore.js';

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
</svelte:head>

<div class="h-screen flex flex-col">
	<!-- Title Bar -->
	<header class="h-12 bg-white dark:bg-[#343541] border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between z-40">
		<div class="flex items-center gap-2">
			<button
				class="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
				aria-label="Open drawer"
				onclick={() => drawerOpen.open()}
				title="Open library"
			>
				<!-- simple bars icon -->
				<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
				</svg>
			</button>
			<h1 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
				Conception.dev Mock-up Generator
			</h1>
		</div>
		<div class="flex items-center gap-3">
			<ThemeToggle />
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
	
	<!-- Left Drawer -->
	<LeftDrawer />
</div>
