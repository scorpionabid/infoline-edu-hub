
import { cacheManager } from '../cache/index.js';

describe('Storage Adapter Tests', () => {
  beforeEach(() => {
    // Clear all caches before each test
    cacheManager.clear();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('should store and retrieve from localStorage', () => {
    // Test direct localStorage adapter
    const key = 'test_local';
    const value = { data: 'test data' };
    
    // Set using the adapter
    cacheManager.localStorage().set(key, value);
    
    // Get using the adapter
    const result = cacheManager.localStorage().get(key);
    expect(result).toEqual(value);
  });

  test('should store and retrieve from sessionStorage', () => {
    // Test direct sessionStorage adapter
    const key = 'test_session';
    const value = { data: 'test data' };
    
    // Set using the adapter
    cacheManager.sessionStorage().set(key, value);
    
    // Get using the adapter
    const result = cacheManager.sessionStorage().get(key);
    expect(result).toEqual(value);
  });

  test('should use specified storage in cacheManager.set', () => {
    // Test cacheManager.set with storage option
    const key = 'test_storage_option';
    const value = { data: 'test with storage option' };
    
    // Set with storage option
    cacheManager.set(key, value, { storage: 'localStorage' });
    
    // Should be in localStorage
    expect(cacheManager.localStorage().get(key)).toEqual(value);
    expect(cacheManager.sessionStorage().get(key)).toBeNull();
    
    // Clear and test sessionStorage
    cacheManager.clear();
    
    cacheManager.set(key, value, { storage: 'sessionStorage' });
    expect(cacheManager.sessionStorage().get(key)).toEqual(value);
    expect(cacheManager.localStorage().get(key)).toBeNull();
  });
});
