/**
 * İnfoLine Unified Cache System - Storage Cache Adapter
 * Browser localStorage/sessionStorage cache with TTL support
 */

import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import type { CacheEntry, CacheOptions, CacheStorageType } from '../core/types';

export class StorageCacheAdapter<T = any> extends BaseCacheAdapter<T> {
  protected storage: Storage;
  protected storageType: CacheStorageType;
  private initialized: boolean = false;

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
    this.initialized = true;
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
      const data = JSON.stringify(entry);
      console.log(`[StorageCache] Saving to ${this.storageType} - Key: ${key}, Data:`, entry);
      this.storage.setItem(key, data);
      console.log(`[StorageCache] Saved to ${this.storageType} - Key: ${key}`);
      return true;
    } catch (error) {
      console.warn(`[StorageCache] Failed to save to ${this.storageType}:`, error);
      return false;
    }
  }

  /**
   * Remove entry from storage
   */
  private removeFromStorage(key: string): void {
    try {
      console.log(`[StorageCache] Removing from ${this.storageType} - Key: ${key}`);
      this.storage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageCache] Failed to remove from ${this.storageType}:`, error);
    }
  }

  protected getCacheKey(key: string): string {
    // Use the parent's prefix handling to maintain consistency
    return super.getCacheKey(key);
  }

  protected isValid(entry: CacheEntry<T>): boolean {
    if (!entry) return false;
    
    const now = Date.now();
    
    // Check TTL
    if (entry.ttl > 0 && (now - entry.timestamp) > entry.ttl) {
      return false;
    }
    
    // Check version
    if (entry.version !== this.version) {
      return false;
    }
    
    return true;
  }

  override get(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    console.log(`[StorageCache] Getting from ${this.storageType} - Key: ${key}, CacheKey: ${cacheKey}`);
    
    // Try memory first
    let entry = this.cache.get(cacheKey);
    console.log(`[StorageCache] Memory cache ${entry ? 'hit' : 'miss'} for key: ${key}`);
    
    // If not in memory, try storage
    if (!entry && this.initialized) {
      try {
        console.log(`[StorageCache] Checking storage for key: ${key}`);
        const stored = this.storage.getItem(cacheKey);
        console.log(`[StorageCache] Raw stored value for ${key}:`, stored);
        
        if (stored) {
          try {
            entry = JSON.parse(stored) as CacheEntry<T>;
            console.log(`[StorageCache] Parsed entry for ${key}:`, entry);
            
            if (this.isValid(entry)) {
              // Add back to memory cache
              console.log(`[StorageCache] Entry is valid, adding to memory cache`);
              this.cache.set(cacheKey, entry);
            } else {
              console.log(`[StorageCache] Entry is invalid, removing from storage`);
              // Remove invalid entry from storage
              this.removeFromStorage(cacheKey);
              entry = undefined;
            }
          } catch (parseError) {
            console.warn(`[StorageCache] Failed to parse stored data for ${key}:`, parseError);
            this.removeFromStorage(cacheKey);
          }
        } else {
          console.log(`[StorageCache] No stored value found for key: ${key}`);
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

  override set(key: string, value: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    
    // Check if we need to evict
    if (this.cache.size >= this.stats.maxSize && !this.cache.has(cacheKey)) {
      this.evict();
    }
    
    const entry = this.createEntry(value, options);
    
    // Save to storage first if initialized
    if (this.initialized) {
      this.saveToStorage(cacheKey, entry);
    }
    
    // Update in-memory cache
    this.cache.set(cacheKey, entry);
    this.updateStats(false);
  }

  delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.removeFromStorage(cacheKey);
    this.updateStats(false);
  }

  clear(): void {
    super.clear(); // Call parent clear to handle cache and stats
    
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

  getStats() {
    return super.getStats();
  }

  override has(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      // Check storage if not in memory
      if (this.initialized) {
        try {
          const stored = this.storage.getItem(cacheKey);
          if (stored) {
            const storedEntry = JSON.parse(stored) as CacheEntry<T>;
            if (this.isValid(storedEntry)) {
              this.cache.set(cacheKey, storedEntry);
              return true;
            } else {
              this.removeFromStorage(cacheKey);
            }
          }
        } catch (error) {
          console.warn(`[StorageCache] Failed to check storage for key ${key}:`, error);
        }
      }
      return false;
    }
    
    if (!this.isValid(entry)) {
      this.cache.delete(cacheKey);
      if (this.initialized) {
        this.removeFromStorage(cacheKey);
      }
      return false;
    }
    
    return true;
  }

  keys(): string[] {
    return super.keys();
  }



  override entries(): [string, T][] {
    return Array.from(this.cache.entries())
      .filter(([_, entry]) => this.isValid(entry))
      .map(([key, entry]) => [key.replace(`${this.prefix}_`, ''), entry.data]);
  }

  /**
   * Remove an entry from cache
   */
  protected remove(key: string): boolean {
    console.log(`[StorageCache] Removing entry: ${key}`);
    const cacheKey = this.getCacheKey(key);
    const wasDeleted = this.cache.delete(cacheKey);
    
    if (this.initialized) {
      this.removeFromStorage(cacheKey);
    }
    
    return wasDeleted;
  }

  /**
   * FIFO eviction strategy for storage
   */
  protected override evict(): void {
    const entries = Array.from(this.cache.entries());
    if (entries.length === 0) return;
    
    // Find the oldest entry
    const [keyToRemove] = entries.reduce((oldest, current) => {
      return (current[1].lastAccess < oldest[1].lastAccess) ? current : oldest;
    });
    
    console.log(`[StorageCache] Evicting key: ${keyToRemove}`);
    this.cache.delete(keyToRemove);
    
    if (this.initialized) {
      this.removeFromStorage(keyToRemove);
    }
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
