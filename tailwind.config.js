/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@skeletonlabs/tw-plugin')({ themes: { preset: [ "skeleton" ] } })
  ],
} 