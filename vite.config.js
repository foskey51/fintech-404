import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import ViteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    ViteCompression({
      algorithm: 'gzip',
      threshold: 1024,
      verbose: true,
    }),
    tailwindcss(),
  ],
});