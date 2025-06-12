
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add allowedHosts configuration
    allowedHosts: [
      "22cfbf06-26bf-4e40-8210-68181ed0c737.lovableproject.com"
    ]
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
    // Suppress deprecation warnings
    devSourcemap: mode === 'development',
  },
  build: {
    // Suppress build warnings
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        if (warning.message.includes('-ms-high-contrast')) return;
        warn(warning);
      },
    },
    // Optimize chunk splitting
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: [
      'src/__tests__/**/enhanced-*.test.ts?(x)',
      'src/__tests__/**/*.test.ts?(x)'
    ],
    testTimeout: 10000,
    threads: false,
    environmentOptions: {
      jest: true
    },
    // Alias paths konfiqurasyonunun testlər içində düzgün işləməsi üçün
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    // Coverage konfiqurasiyası
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
}));
