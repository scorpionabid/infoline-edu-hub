
import type { SupportedLanguage, LanguageTranslations } from '@/types/translation';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  checksum?: string;
  priority?: boolean;
  version: string;
}

interface CacheConfig {
  maxMemoryEntries: number;
  defaultTTL: number;
  priorityTTL: number;
  version: string;
  storagePrefix: string;
}

interface CrossTabMessage {
  type: 'cache_update' | 'cache_clear' | 'cache_sync';
  key?: string;
  data?: any;
  timestamp: number;
}

/**
 * Enhanced Cache Service with predictable behavior and cross-tab sync
 */
export class EnhancedCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  private config: CacheConfig;
  private broadcastChannel?: BroadcastChannel;
  private isOnline = navigator.onLine;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxMemoryEntries: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      priorityTTL: 24 * 60 * 60 * 1000, // 24 hours
      version: '3.0',
      storagePrefix: 'infoline_enhanced_cache',
      ...config
    };

    this.initializeCrossTabs();
    this.setupNetworkListeners();
    this.startPeriodicCleanup();
  }

  /**
   * Initialize cross-tab communication
   */
  private initializeCrossTabs(): void {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('infoline_cache_sync');
        this.broadcastChannel.onmessage = (event) => {
          this.handleCrossTabMessage(event.data);
        };
      }
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error);
    }
  }

  /**
   * Handle cross-tab messages
   */
  private handleCrossTabMessage(message: CrossTabMessage): void {
    switch (message.type) {
      case 'cache_update':
        if (message.key && message.data) {
          this.memoryCache.set(message.key, message.data);
          this.updateAccess(message.key);
        }
        break;
      case 'cache_clear':
        if (message.key) {
          this.memoryCache.delete(message.key);
          this.accessOrder.delete(message.key);
        } else {
          this.memoryCache.clear();
          this.accessOrder.clear();
        }
        break;
      case 'cache_sync':
        // Respond with current cache state if needed
        break;
    }
  }

  /**
   * Broadcast cache changes to other tabs
   */
  private broadcast(message: CrossTabMessage): void {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (error) {
        console.warn('Failed to broadcast cache message:', error);
      }
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOnlineCache();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Sync cache when coming back online
   */
  private async syncOnlineCache(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Check if critical translations need updating
      const azTranslations = this.get('translations_az');
      if (!azTranslations) {
        // Signal to reload critical data
        window.dispatchEvent(new CustomEvent('cache:reload_critical'));
      }
    } catch (error) {
      console.warn('Failed to sync online cache:', error);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }

  /**
   * Generate checksum for cache validation
   */
  private generateChecksum(data: any): string {
    try {
      const str = JSON.stringify(data);
      return btoa(str.slice(0, 100)).slice(0, 16);
    } catch {
      return 'invalid';
    }
  }

  /**
   * Update access order for LRU
   */
  private updateAccess(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    if (this.memoryCache.size < this.config.maxMemoryEntries) return;

    let lruKey = '';
    let lruAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.memoryCache.delete(lruKey);
      this.accessOrder.delete(lruKey);
    }
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.config.storagePrefix}_${key}`;
  }

  /**
   * Save to localStorage with fallback handling
   */
  private saveToLocalStorage(key: string, entry: CacheEntry): boolean {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      return true;
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
      
      // Try to free space by clearing old entries
      this.clearExpiredFromLocalStorage();
      
      try {
        const cacheKey = this.getCacheKey(key);
        localStorage.setItem(cacheKey, JSON.stringify(entry));
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Load from localStorage with validation
   */
  private loadFromLocalStorage(key: string): CacheEntry | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const stored = localStorage.getItem(cacheKey);
      
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);

      // Validate version
      if (entry.version !== this.config.version) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      // Check expiry
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      // Validate checksum if available
      if (entry.checksum) {
        const currentChecksum = this.generateChecksum(entry.data);
        if (currentChecksum !== entry.checksum) {
          localStorage.removeItem(cacheKey);
          return null;
        }
      }

      return entry;
    } catch (error) {
      console.warn(`Failed to load from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Clear expired entries from localStorage
   */
  private clearExpiredFromLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storagePrefix)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '');
            if (Date.now() - entry.timestamp > entry.ttl) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear expired localStorage entries:', error);
    }
  }

  /**
   * Set cache entry with predictable behavior
   */
  set<T>(key: string, data: T, options: { ttl?: number; priority?: boolean } = {}): void {
    const { ttl = this.config.defaultTTL, priority = false } = options;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: priority ? this.config.priorityTTL : ttl,
      checksum: this.generateChecksum(data),
      priority,
      version: this.config.version
    };

    // Evict if necessary
    this.evictLRU();

    // Set in memory
    this.memoryCache.set(key, entry);
    this.updateAccess(key);

    // Save to localStorage
    this.saveToLocalStorage(key, entry);

    // Broadcast to other tabs
    this.broadcast({
      type: 'cache_update',
      key,
      data: entry,
      timestamp: Date.now()
    });

    console.log(`[EnhancedCache] Set ${key} (priority: ${priority})`);
  }

  /**
   * Get cache entry with predictable fallback
   */
  get<T>(key: string): T | null {
    // Check memory first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
      this.updateAccess(key);
      return memoryEntry.data as T;
    }

    // Check localStorage
    const storageEntry = this.loadFromLocalStorage(key);
    if (storageEntry) {
      // Add back to memory
      this.memoryCache.set(key, storageEntry);
      this.updateAccess(key);
      return storageEntry.data as T;
    }

    return null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.accessOrder.delete(key);
    
    try {
      localStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.warn(`Failed to delete from localStorage: ${key}`, error);
    }

    this.broadcast({
      type: 'cache_clear',
      key,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;

    // Clear localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.config.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }

    this.broadcast({
      type: 'cache_clear',
      timestamp: Date.now()
    });
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      this.accessOrder.delete(key);
    });

    this.clearExpiredFromLocalStorage();

    if (keysToDelete.length > 0) {
      console.log(`[EnhancedCache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      maxSize: this.config.maxMemoryEntries,
      hitRate: this.accessCounter > 0 ? (this.memoryCache.size / this.accessCounter) * 100 : 0,
      isOnline: this.isOnline,
      version: this.config.version
    };
  }

  /**
   * Preload critical data
   */
  async preloadCritical(loaders: Record<string, () => Promise<any>>): Promise<void> {
    const promises = Object.entries(loaders).map(async ([key, loader]) => {
      try {
        const existingData = this.get(key);
        if (!existingData) {
          const data = await loader();
          this.set(key, data, { priority: true });
        }
      } catch (error) {
        console.warn(`Failed to preload ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Destroy cache service
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    this.clear();
  }
}

// Global enhanced cache instance
export const enhancedCache = new EnhancedCacheService();
export default enhancedCache;
