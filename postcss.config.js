import { fileURLToPath } from 'node:url';

export default {
  plugins: {
    // Explicit path so Tailwind finds this config even when Vite starts from the repo root.
    tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) },
    autoprefixer: {}
  }
};
