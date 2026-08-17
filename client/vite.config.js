import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fail rather than quietly moving to 5174 if the port is taken. A silent
    // move breaks CORS, since the server only allows the origin in CLIENT_ORIGIN
    port: 5173,
    strictPort: true,
  },
});
