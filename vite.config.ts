
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/__tests__/**/*.test.ts?(x)'],
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
    }
  }
}));
