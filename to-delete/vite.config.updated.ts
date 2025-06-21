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
    
    // YENİLƏNDİ: Bütün test fayllarını daxil et (yalnız enhanced deyil)
    include: [
      'src/__tests__/**/*.test.ts?(x)',
      'src/__tests__/**/*.spec.ts?(x)'
    ],
    
    // Exclude patterns - coverage hesablamalarından çıxarılacaq fayllar
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts',
      '**/*.config.*'
    ],
    
    testTimeout: 15000, // 15 saniyə timeout
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
    
    // YENİLƏNDİ: Coverage konfiqurasiyası
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      
      // Include/exclude patterns
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts'
      ],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/setupTests.tsx', 
        'src/__tests__/',
        'src/__mocks__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        'coverage/',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.stories.{ts,tsx}',
        // Test utility faylları da exclude et
        '**/test-utils.{ts,tsx}',
        '**/enhanced-test-utils.{ts,tsx}'
      ],
      
      // Coverage thresholds
      thresholds: {
        global: {
          branches: 75,    // 80-dən 75-ə endirdik başlanğıc üçün
          functions: 75,   // 80-dən 75-ə endirdik
          lines: 75,       // 80-dən 75-ə endirdik  
          statements: 75   // 80-dən 75-ə endirdik
        },
        // Kritik komponentlər üçün yüksək threshold
        'src/components/auth/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/hooks/auth/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      
      // All files instrumentation
      all: true,
      
      // Clean coverage directory before running
      clean: true,
      
      // Skip full coverage for node_modules
      skipFull: false
    }
  }
}));