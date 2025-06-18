
/**
 * İnfoLine Unified Cache System - Cross-Tab Sync Strategy
 * Browser tab-ları arasında cache sinxronizasiyası
 */

import type { CrossTabMessage, CacheAdapter } from '../core/types';

export class CrossTabSyncStrategy {
  private broadcastChannel?: BroadcastChannel;
  private adapters = new Set<CacheAdapter<any>>();
  private isEnabled = false;
  private readonly channelName = 'infoline_cache_sync';
  private readonly storageKey = 'infoline_crosssync_message';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize cross-tab communication
   */
  private initialize(): void {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        this.isEnabled = true;
        console.log('[CrossTabSync] Initialized BroadcastChannel');
      } else {
        console.warn('[CrossTabSync] BroadcastChannel not supported');
        this.setupStorageSync();
      }
    } catch (error) {
      console.warn('[CrossTabSync] Failed to initialize:', error);
      this.setupStorageSync();
    }
  }

  /**
   * Fallback to storage events for cross-tab sync
   */
  private setupStorageSync(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.storageKey) {
          try {
            const message: CrossTabMessage = JSON.parse(event.newValue || '{}');
            this.handleMessage(message);
          } catch (error) {
            console.warn('[CrossTabSync] Failed to parse storage sync message:', error);
          }
        }
      });
      this.isEnabled = true;
      console.log('[CrossTabSync] Initialized storage-based sync');
    }
  }

  /**
   * Handle incoming cross-tab messages
   */
  private handleMessage(message: CrossTabMessage): void {
    if (!message || message.source === this.getTabId()) {
      return; // Ignore messages from this tab
    }

    console.log('[CrossTabSync] Received message:', message.type, message.key);

    for (const adapter of this.adapters) {
      try {
        switch (message.type) {
          case 'cache_update':
            if (message.key && message.value !== undefined) {
              adapter.set(message.key, message.value);
            }
            break;
          
          case 'cache_delete':
            if (message.key) {
              adapter.delete(message.key);
            }
            break;
          
          case 'cache_clear':
            adapter.clear();
            break;
          
          case 'cache_sync':
            // Respond with current cache state if needed
            this.sendSyncResponse(adapter);
            break;
        }
      } catch (error) {
        console.warn('[CrossTabSync] Failed to handle message for adapter:', error);
      }
    }
  }

  /**
   * Send sync response with current cache state
   */
  private sendSyncResponse(adapter: CacheAdapter<any>): void {
    // Basic sync - in a real implementation we'd have a keys() method
    console.log('[CrossTabSync] Sync response requested');
  }

  /**
   * Get unique tab identifier
   */
  private getTabId(): string {
    if (typeof window !== 'undefined') {
      // Use session storage to create a unique ID for this tab
      let tabId = sessionStorage.getItem('infoline_tab_id');
      if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('infoline_tab_id', tabId);
      }
      return tabId;
    }
    return 'unknown';
  }

  /**
   * Broadcast message to other tabs
   */
  private broadcast(message: CrossTabMessage): void {
    if (!this.isEnabled) return;

    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message);
      } else {
        // Fallback to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(message));
        // Remove immediately to trigger storage event
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.warn('[CrossTabSync] Failed to broadcast message:', error);
    }
  }

  /**
   * Register cache adapter for sync
   */
  register(adapter: CacheAdapter<any>): void {
    this.adapters.add(adapter);
    console.log(`[CrossTabSync] Registered adapter, total: ${this.adapters.size}`);
  }

  /**
   * Unregister cache adapter
   */
  unregister(adapter: CacheAdapter<any>): void {
    this.adapters.delete(adapter);
    console.log(`[CrossTabSync] Unregistered adapter, total: ${this.adapters.size}`);
  }

  /**
   * Notify other tabs about cache update
   */
  notifyUpdate(key: string, value: any): void {
    this.broadcast({
      type: 'cache_update',
      key,
      value,
      timestamp: Date.now(),
      source: this.getTabId()
    });
  }

  /**
   * Notify other tabs about cache deletion
   */
  notifyDelete(key: string): void {
    this.broadcast({
      type: 'cache_delete',
      key,
      timestamp: Date.now(),
      source: this.getTabId()
    });
  }

  /**
   * Notify other tabs about cache clear
   */
  notifyClear(): void {
    this.broadcast({
      type: 'cache_clear',
      timestamp: Date.now(),
      source: this.getTabId()
    });
  }

  /**
   * Request sync from other tabs
   */
  requestSync(): void {
    this.broadcast({
      type: 'cache_sync',
      timestamp: Date.now(),
      source: this.getTabId()
    });
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      adaptersCount: this.adapters.size,
      channelName: this.channelName,
      tabId: this.getTabId(),
      hasBroadcastChannel: !!this.broadcastChannel
    };
  }

  /**
   * Destroy sync strategy
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    this.adapters.clear();
    this.isEnabled = false;
    console.log('[CrossTabSync] Destroyed');
  }
}

export default CrossTabSyncStrategy;
