import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `npm run dev:mobile` serves over HTTPS on the local network so a phone can open
// the app. Phone browsers only allow the camera on HTTPS (or localhost).
export default defineConfig(({ mode }) => {
  const mobile = mode === 'mobile';
  return {
    plugins: [react(), ...(mobile ? [basicSsl()] : [])],
    server: {
      host: mobile ? true : undefined,
      proxy: {
        '/api': 'http://localhost:3000'
      }
    }
  };
});
