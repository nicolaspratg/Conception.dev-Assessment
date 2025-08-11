<script lang="ts">
  import { themeStore } from "$lib/stores/themeStore";
  $: isDark = $themeStore;
  function onChange() {
    themeStore.toggle();
  }
</script>

<!-- Colors adapted to our palette: emerald for "on" -->
<label
  class="group relative inline-flex w-11 shrink-0 rounded-full
         bg-gray-200 dark:bg-gray-700 p-0.5
         outline-offset-2 outline-emerald-600
         ring-1 ring-inset ring-gray-900/5
         transition-colors duration-200 ease-in-out
         has-[:checked]:bg-emerald-600 has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
>
  <span
    class="relative size-5 rounded-full bg-white shadow-sm ring-1 ring-gray-900/5
           transition-transform duration-200 ease-in-out
           group-has-[:checked]:translate-x-5"
  >
    <!-- Off icon (Sun) -->
    <span
      aria-hidden="true"
      class="absolute inset-0 flex size-full items-center justify-center
             opacity-100 transition-opacity duration-200 ease-in
             group-has-[:checked]:opacity-0 group-has-[:checked]:duration-100 group-has-[:checked]:ease-out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4 text-gray-600"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    </span>
    <!-- On icon (Moon) -->
    <span
      aria-hidden="true"
      class="absolute inset-0 flex size-full items-center justify-center
             opacity-0 transition-opacity duration-100 ease-out
             group-has-[:checked]:opacity-100 group-has-[:checked]:duration-200 group-has-[:checked]:ease-in
             bg-[#343541] rounded-full"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4 text-white"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
      </svg>
    </span>
  </span>

  <!-- The input can be last; :has() matches any descendant -->
  <input
    type="checkbox"
    aria-label="Toggle dark mode"
    class="absolute inset-0 appearance-none cursor-pointer focus:outline-none"
    checked={isDark}
    on:change={onChange}
  />
</label>

