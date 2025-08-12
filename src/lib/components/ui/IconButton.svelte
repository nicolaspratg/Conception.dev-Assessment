<script lang="ts">
  export let ariaLabel = '';
</script>

<button
  type="button"
  class="inline-flex h-8 w-8 items-center justify-center rounded-md
         text-gray-400 hover:bg-gray-950/10 hover:text-gray-700
         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600
         dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
  aria-label={ariaLabel}
>
  <slot />
</button>
