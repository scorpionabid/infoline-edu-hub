/**
 * İnfoLine Unified Cache System - Test Suite
 * Yeni cache sisteminin funksionallığını test edir
 */

import { cacheManager, CacheUtils, CacheDebug, CACHE_KEYS, CACHE_TTL } from '../cache/index.js';

describe('İnfoLine Unified Cache System', () => {
  beforeEach(() => {
    // Clear all caches before each test
    cacheManager.clear();
  });

  afterAll(() => {
    // Clean up after all tests
    cacheManager.destroy();
  });

  describe('Basic Cache Operations', () => {
    test('should set and get data from memory cache', () => {
      const testData = { test: 'value', timestamp: Date.now() };
      
      cacheManager.set('test_key', testData);
      const retrieved = cacheManager.get('test_key');
      
      expect(retrieved).toEqual(testData);
    });

    test('should return null for non-existent keys', () => {
      const result = cacheManager.get('non_existent_key');
      expect(result).toBeNull();
    });

    test('should delete specific keys', () => {
      cacheManager.set('test_key', 'test_value');
      expect(cacheManager.has('test_key')).toBe(true);
      
      cacheManager.delete('test_key');
      expect(cacheManager.has('test_key')).toBe(false);
    });

    test('should clear all caches', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      
      expect(cacheManager.has('key1')).toBe(true);
      expect(cacheManager.has('key2')).toBe(true);
      
      cacheManager.clear();
      
      expect(cacheManager.has('key1')).toBe(false);
      expect(cacheManager.has('key2')).toBe(false);
    });
  });

  describe('Storage Strategy Selection', () => {
    test('should use memory storage by default', () => {
      cacheManager.set('memory_test', 'value');
      
      const memoryValue = cacheManager.memory().get('memory_test');
      expect(memoryValue).toBe('value');
    });

    test('should use localStorage when specified', () => {
      cacheManager.set('storage_test', 'value', { storage: 'localStorage' });
      
      const storageValue = cacheManager.localStorage().get('storage_test');
      expect(storageValue).toBe('value');
    });

    test('should use sessionStorage when specified', () => {
      cacheManager.set('session_test', 'value', { storage: 'sessionStorage' });
      
      const sessionValue = cacheManager.sessionStorage().get('session_test');
      expect(sessionValue).toBe('value');
    });
  });

  describe('Auto Strategy Selection', () => {
    test('should select appropriate strategy for user data', () => {
      const userData = { userId: 123, name: 'Test User' };
      const { adapter, options } = cacheManager.auto('user_profile', userData);
      
      expect(options.storage).toBe('memory');
      expect(options.priority).toBe(true);
    });

    test('should select localStorage for large data', () => {
      const largeData = { data: 'x'.repeat(15000) }; // >10KB
      const { adapter, options } = cacheManager.auto('large_data', largeData);
      
      expect(options.storage).toBe('localStorage');
    });

    test('should select memory for reports with short TTL', () => {
      const reportData = { report_stats: [1, 2, 3] };
      const { adapter, options } = cacheManager.auto('report_data', reportData);
      
      expect(options.storage).toBe('memory');
      expect(options.ttl).toBe(CACHE_TTL.SHORT);
    });
  });

  describe('TTL and Expiration', () => {
    test('should expire data after TTL', async () => {
      cacheManager.set('expiring_key', 'value', { ttl: 100 }); // 100ms TTL
      
      expect(cacheManager.get('expiring_key')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cacheManager.get('expiring_key')).toBeNull();
    });

    test('should not expire priority data prematurely', () => {
      cacheManager.set('priority_key', 'value', { 
        priority: true, 
        ttl: CACHE_TTL.VERY_LONG 
      });
      
      expect(cacheManager.get('priority_key')).toBe('value');
    });
  });

  describe('Migration Utilities', () => {
    test('should migrate from old lib/cache usage', () => {
      CacheUtils.migrateFromLibCache('old_key', 'old_value', 60000);
      
      const migrated = cacheManager.get('old_key', 'localStorage');
      expect(migrated).toBe('old_value');
    });

    test('should migrate from regions cache', () => {
      const regions = [{ id: 1, name: 'Test Region' }];
      CacheUtils.migrateFromRegionsCache(regions);
      
      const migratedRegions = cacheManager.get(CACHE_KEYS.REGIONS);
      expect(migratedRegions).toEqual(regions);
    });

    test('should migrate from translation cache', () => {
      const translations = { hello: 'Salam', goodbye: 'Sağ olun' };
      CacheUtils.migrateFromTranslationCache('az', translations);
      
      const migratedTranslations = cacheManager.get('translations_az');
      expect(migratedTranslations).toEqual(translations);
    });
  });

  describe('Cache Statistics', () => {
    test('should track cache statistics', () => {
      // Perform some cache operations
      cacheManager.set('stats_key1', 'value1');
      cacheManager.set('stats_key2', 'value2');
      cacheManager.get('stats_key1'); // Hit
      cacheManager.get('non_existent'); // Miss
      
      const stats = cacheManager.getStats();
      
      expect(stats.total.hits).toBeGreaterThan(0);
      expect(stats.total.misses).toBeGreaterThan(0);
      expect(stats.total.size).toBeGreaterThan(0);
    });

    test('should provide health check', () => {
      const health = cacheManager.healthCheck();
      
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('recommendations');
    });
  });

  describe('Cleanup and Maintenance', () => {
    test('should cleanup expired entries', async () => {
      // Set data with short TTL
      cacheManager.set('cleanup_test1', 'value1', { ttl: 50 });
      cacheManager.set('cleanup_test2', 'value2', { ttl: 50 });
      
      expect(cacheManager.has('cleanup_test1')).toBe(true);
      expect(cacheManager.has('cleanup_test2')).toBe(true);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Run cleanup
      cacheManager.cleanup();
      
      expect(cacheManager.has('cleanup_test1')).toBe(false);
      expect(cacheManager.has('cleanup_test2')).toBe(false);
    });
  });

  describe('Debug and Performance', () => {
    test('should run debug tests successfully', () => {
      expect(() => {
        CacheDebug.runTests();
      }).not.toThrow();
    });

    test('should export cache contents', () => {
      cacheManager.set('export_test', 'value');
      
      const exported = cacheManager.export();
      
      expect(exported).toHaveProperty('memory');
      expect(exported).toHaveProperty('localStorage');
      expect(exported).toHaveProperty('sessionStorage');
    });
  });
});

// Performance benchmark test
describe('Cache Performance Benchmarks', () => {
  test('should handle high-volume operations efficiently', () => {
    const startTime = Date.now();
    
    // Perform 1000 set operations
    for (let i = 0; i < 1000; i++) {
      cacheManager.set(`perf_key_${i}`, `value_${i}`);
    }
    
    // Perform 1000 get operations
    for (let i = 0; i < 1000; i++) {
      cacheManager.get(`perf_key_${i}`);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(1000); // 1 second
    
    console.log(`Performance test: 2000 operations completed in ${duration}ms`);
  });
});

// Test file for Unified Cache System
