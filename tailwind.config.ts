import preset from './tailwind.preset.mjs'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: ['./src/**/*.{vue,ts,tsx}'],
}
