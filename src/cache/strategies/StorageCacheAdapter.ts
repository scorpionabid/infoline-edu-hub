/**
 * İnfoLine Unified Cache System - Storage Cache Adapter
 * Browser localStorage/sessionStorage cache with TTL support
 */

import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import type { CacheEntry, CacheOptions, CacheStorageType } from '../core/types';

export class StorageCacheAdapter<T = any> extends BaseCacheAdapter<T> {
  private storage: Storage;
  private storageType: CacheStorageType;

  constructor(
    storageType: CacheStorageType = 'localStorage',
    maxSize: number = 50,
    version: string = '1.0'
  ) {
    super(`infoline_${storageType}`, maxSize, version);
    this.storageType = storageType;
    
    if (typeof window === 'undefined') {
      throw new Error('StorageCacheAdapter can only be used in browser environment');
    }
    
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    
    // Initialize cache from storage
    this.initializeFromStorage();
  }

  /**
   * Initialize cache from existing storage
   */
  private initializeFromStorage(): void {
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const stored = this.storage.getItem(key);
          if (stored) {
            try {
              const entry: CacheEntry<T> = JSON.parse(stored);
              
              // Validate entry
              if (this.isValid(entry)) {
                this.cache.set(key, entry);
              } else {
                // Remove invalid entry from storage
                this.storage.removeItem(key);
              }
            } catch {
              // Remove corrupted entry
              this.storage.removeItem(key);
            }
          }
        }
      }
      
      this.updateStats(false); // Update size after initialization
      console.log(`[StorageCache] Initialized ${this.storageType} with ${this.cache.size} entries`);
    } catch (error) {
      console.warn(`[StorageCache] Failed to initialize from ${this.storageType}:`, error);
    }
  }

  /**
   * Save entry to storage
   */
  private saveToStorage(key: string, entry: CacheEntry<T>): boolean {
    try {
      this.storage.setItem(key, JSON.stringify(entry));
      return true;
    } catch (error) {
      console.warn(`[StorageCache] Failed to save to ${this.storageType}:`, error);
      
      // Try to free space by cleaning expired entries
      this.cleanup();
      
      try {
        this.storage.setItem(key, JSON.stringify(entry));
        return true;
      } catch {
        console.error(`[StorageCache] Still unable to save after cleanup`);
        return false;
      }
    }
  }

  /**
   * Remove entry from storage
   */
  private removeFromStorage(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageCache] Failed to remove from ${this.storageType}:`, error);
    }
  }

  /**
   * FIFO eviction strategy for storage
   */
  protected evict(): void {
    if (this.cache.size < this.stats.maxSize) return;

    // Find oldest entry (FIFO)
    let oldestKey = '';
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removeFromStorage(oldestKey);
      console.log(`[StorageCache] Evicted oldest entry: ${oldestKey}`);
    }
  }

  /**
   * Override get to handle storage
   */
  get(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    
    // Try memory first
    let entry = this.cache.get(cacheKey);
    
    // If not in memory, try storage
    if (!entry) {
      try {
        const stored = this.storage.getItem(cacheKey);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
          
          if (this.isValid(entry)) {
            // Add back to memory cache
            this.cache.set(cacheKey, entry);
          } else {
            // Remove invalid entry from storage
            this.removeFromStorage(cacheKey);
            entry = undefined;
          }
        }
      } catch (error) {
        console.warn(`[StorageCache] Failed to read from ${this.storageType}:`, error);
        this.removeFromStorage(cacheKey);
      }
    }
    
    if (!entry) {
      this.updateStats(false);
      return null;
    }
    
    if (!this.isValid(entry)) {
      this.cache.delete(cacheKey);
      this.removeFromStorage(cacheKey);
      this.updateStats(false);
      return null;
    }
    
    this.updateAccess(entry);
    this.updateStats(true);
    return entry.data;
  }

  /**
   * Override set to handle storage
   */
  set(key: string, value: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    
    // Check if we need to evict
    if (this.cache.size >= this.stats.maxSize && !this.cache.has(cacheKey)) {
      this.evict();
    }
    
    const entry = this.createEntry(value, options);
    
    // Save to storage first
    if (this.saveToStorage(cacheKey, entry)) {
      // Only set in memory if storage succeeded
      this.cache.set(cacheKey, entry);
      this.updateStats(false);
    }
  }

  /**
   * Override delete to handle storage
   */
  delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.removeFromStorage(cacheKey);
    this.updateStats(false);
  }

  /**
   * Override clear to handle storage
   */
  clear(): void {
    // Clear memory cache
    super.clear();
    
    // Clear storage entries
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => this.storage.removeItem(key));
      console.log(`[StorageCache] Cleared ${keysToRemove.length} entries from ${this.storageType}`);
    } catch (error) {
      console.warn(`[StorageCache] Failed to clear ${this.storageType}:`, error);
    }
  }

  /**
   * Override cleanup to handle storage
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // Check memory cache
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    }
    
    // Check storage entries
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          try {
            const stored = this.storage.getItem(key);
            if (stored) {
              const entry: CacheEntry<T> = JSON.parse(stored);
              if (!this.isValid(entry)) {
                keysToDelete.push(key);
              }
            }
          } catch {
            // Remove corrupted entries
            keysToDelete.push(key);
          }
        }
      }
    } catch (error) {
      console.warn(`[StorageCache] Failed to scan ${this.storageType} during cleanup:`, error);
    }
    
    // Remove invalid entries
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.removeFromStorage(key);
    });
    
    this.stats.lastCleanup = now;
    this.updateStats(false);
    
    console.log(`[StorageCache] Cleaned up ${keysToDelete.length} entries from ${this.storageType}`);
  }

  /**
   * Get storage-specific statistics
   */
  getStorageStats() {
    const stats = this.getStats();
    let storageUsed = 0;
    let storageEntries = 0;
    
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.prefix)) {
          const value = this.storage.getItem(key);
          if (value) {
            storageUsed += value.length * 2; // Approximate bytes (2 bytes per char)
            storageEntries++;
          }
        }
      }
    } catch (error) {
      console.warn(`[StorageCache] Failed to calculate storage stats:`, error);
    }
    
    return {
      ...stats,
      storageType: this.storageType,
      storageUsedBytes: storageUsed,
      storageEntries,
      memoryStorageRatio: storageEntries > 0 ? this.cache.size / storageEntries : 0
    };
  }
}

export default StorageCacheAdapter;
