import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Séparer les bibliothèques PDF (lourdes)
              'pdf-vendor': ['pdfjs-dist', 'pdf-lib'],
              // Séparer les bibliothèques UI
              'ui-vendor': ['framer-motion', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
              // Séparer React et ses dépendances
              'react-vendor': ['react', 'react-dom'],
              // Utilitaires légers
              'utils-vendor': ['uuid', 'clsx', 'tailwind-merge', 'lucide-react']
            }
          }
        },
        // Augmenter la limite du warning (optionnel)
        chunkSizeWarningLimit: 1000
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
