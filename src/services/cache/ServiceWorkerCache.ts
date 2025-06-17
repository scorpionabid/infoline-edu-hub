
/**
 * Service Worker Cache Integration Preparation
 * Bu fayl gələcəkdə service worker cache strategiyalarını dəstəkləmək üçün hazırlanmışdır
 */

interface ServiceWorkerCacheConfig {
  cacheName: string;
  version: string;
  strategies: {
    translations: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    api: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    static: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  };
}

export class ServiceWorkerCachePrep {
  private config: ServiceWorkerCacheConfig;
  private isServiceWorkerSupported: boolean;

  constructor(config: ServiceWorkerCacheConfig) {
    this.config = config;
    this.isServiceWorkerSupported = 'serviceWorker' in navigator;
  }

  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return this.isServiceWorkerSupported;
  }

  /**
   * Register service worker (placeholder for future implementation)
   */
  async register(): Promise<boolean> {
    if (!this.isServiceWorkerSupported) {
      console.warn('[ServiceWorkerCache] Service worker not supported');
      return false;
    }

    try {
      // Future implementation will register actual service worker
      console.log('[ServiceWorkerCache] Service worker registration prepared');
      return true;
    } catch (error) {
      console.error('[ServiceWorkerCache] Registration failed:', error);
      return false;
    }
  }

  /**
   * Prepare cache strategies for different resource types
   */
  getCacheStrategies() {
    return {
      translations: {
        strategy: this.config.strategies.translations,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 10
      },
      api: {
        strategy: this.config.strategies.api,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxEntries: 50
      },
      static: {
        strategy: this.config.strategies.static,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 100
      }
    };
  }

  /**
   * Generate cache configuration for service worker
   */
  generateServiceWorkerConfig() {
    return {
      cacheName: `${this.config.cacheName}-v${this.config.version}`,
      strategies: this.getCacheStrategies(),
      precacheUrls: [
        '/translations/az.json',
        '/translations/en.json',
        '/translations/ru.json',
        '/translations/tr.json'
      ]
    };
  }

  /**
   * Post message to service worker
   */
  async postMessage(message: any): Promise<void> {
    if (!this.isServiceWorkerSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage(message);
      }
    } catch (error) {
      console.warn('[ServiceWorkerCache] Failed to post message:', error);
    }
  }

  /**
   * Clear service worker cache
   */
  async clearCache(): Promise<void> {
    if (!this.isServiceWorkerSupported) return;

    try {
      await this.postMessage({ type: 'CLEAR_CACHE' });
      console.log('[ServiceWorkerCache] Cache clear message sent');
    } catch (error) {
      console.warn('[ServiceWorkerCache] Failed to clear cache:', error);
    }
  }
}

// Global instance
export const serviceWorkerCache = new ServiceWorkerCachePrep({
  cacheName: 'infoline-cache',
  version: '1.0',
  strategies: {
    translations: 'cache-first',
    api: 'network-first',
    static: 'cache-first'
  }
});

export default serviceWorkerCache;
