
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  
  // lovable-tagger yalnız development modə üçün və əgər mövcuddursa əlavə et
  if (mode === 'development') {
    try {
      const { componentTagger } = require('lovable-tagger');
      plugins.push(componentTagger());
    } catch (error) {
      // lovable-tagger mövcud deyildir, xəta ignore ediləcək
      console.log('lovable-tagger not found, continuing without it');
    }
  }
  
  return {
    plugins,
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [
        "22cfbf06-26bf-4e40-8210-68181ed0c737.lovableproject.com"
      ]
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    build: {
      target: 'esnext',
      minify: 'esbuild', // terser əvəzinə esbuild istifadə et
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk - əsas kitabxanalar
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              '@tanstack/react-query',
              '@supabase/supabase-js'
            ],
            // UI Components chunk
            ui: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              'lucide-react'
            ],
            // Utils chunk
            utils: [
              'date-fns',
              'clsx',
              'class-variance-authority',
              'tailwind-merge'
            ],
            // Chart və data visualization
            charts: [
              'recharts'
            ],
            // File processing
            files: [
              'xlsx',
              'file-saver',
              'react-csv'
            ]
          }
        }
      },
      // Chunk size limit artırılır (default 500kb)
      chunkSizeWarningLimit: 1000
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.tsx',
      include: [
        'src/__tests__/**/*.test.ts?(x)',
        'src/__tests__/**/*.spec.ts?(x)'
      ],
      testTimeout: 10000,
      threads: false,
      environmentOptions: {
        jest: true
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/setupTests.ts',
          'src/__tests__/',
          '**/*.d.ts',
          '**/*.config.*',
          'dist/',
          'build/'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    }
  };
});
