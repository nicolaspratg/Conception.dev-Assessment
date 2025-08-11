<script lang="ts">
  export let size = 16; // px
  export let className = "text-gray-500 dark:text-gray-300";
</script>

<div
  class={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-0.125em] ${className}`}
  style={`width:${size}px;height:${size}px`}
  role="status"
  aria-label="Loading"
></div>
