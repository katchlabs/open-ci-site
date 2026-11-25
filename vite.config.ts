import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function spaFallbackPlugin() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const indexHtml = resolve(distDir, 'index.html');
      const notFoundHtml = resolve(distDir, '404.html');
      if (existsSync(indexHtml)) {
        copyFileSync(indexHtml, notFoundHtml);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallbackPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-slug'],
        },
      },
    },
  },
});
