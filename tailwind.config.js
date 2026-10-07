/** @type {import('tailwindcss').Config} */
export default {
  // Hover styles only on devices with a real pointer, so taps don't leave buttons stuck "hovered".
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Replaces (not extends) Tailwind's default colors, so only this palette is available.
    // Blue palette (#1B262C, #0F4C75, #3282B8, #BBE1FA) on a white page, plus a neutral grey
    // for secondary text and a red reserved for errors.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ink: { DEFAULT: '#1B262C', soft: '#52606D' },
      accent: { DEFAULT: '#0F4C75', dark: '#0B3A5A', soft: '#BBE1FA' },
      sage: '#3282B8',
      cream: '#FFFFFF',
      page: '#E3F2FD',
      danger: { DEFAULT: '#B42318', soft: '#FEF3F2' }
    },
    extend: {
      // Tailwind's built-in ring default is its own blue; use the palette instead.
      ringColor: { DEFAULT: '#0F4C75' },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
};
