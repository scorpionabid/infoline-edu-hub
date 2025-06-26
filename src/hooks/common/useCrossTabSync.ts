
import { useEffect, useCallback, useRef } from 'react';

interface CrossTabSyncOptions {
  channel: string;
  onMessage?: (data: any) => void;
  onTabsChange?: (tabCount: number) => void;
}

export const useCrossTabSync = (options: CrossTabSyncOptions) => {
  const { channel, onMessage, onTabsChange } = options;
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const tabId = useRef<string>(Math.random().toString(36).substr(2, 9));
  const activeTabs = useRef<Set<string>>(new Set([tabId.current]));

  /**
   * Send message to all tabs
   */
  const sendMessage = useCallback((data: any) => {
    if (broadcastChannel.current) {
      try {
        broadcastChannel.current.postMessage({
          ...data,
          fromTab: tabId.current,
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('[CrossTabSync] Failed to send message:', error);
      }
    }
  }, []);

  /**
   * Send heartbeat to other tabs
   */
  const sendHeartbeat = useCallback(() => {
    sendMessage({ type: 'heartbeat' });
  }, [sendMessage]);

  /**
   * Handle incoming messages
   */
  const handleMessage = useCallback((event: MessageEvent) => {
    const { data } = event;
    
    if (data.fromTab === tabId.current) {
      return; // Ignore own messages
    }

    switch (data.type) {
      case 'heartbeat': {
        activeTabs.current.add(data.fromTab);
        if (onTabsChange) {
          onTabsChange(activeTabs.current.size);
        }
        break; }
      case 'tab_closing': {
        activeTabs.current.delete(data.fromTab);
        if (onTabsChange) {
          onTabsChange(activeTabs.current.size);
        }
        break; }
      default:
        if (onMessage) {
          onMessage(data);
        }
        break; }
    }
  }, [onMessage, onTabsChange]);

  useEffect(() => {
    // Initialize BroadcastChannel if available
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel.current = new BroadcastChannel(channel);
        broadcastChannel.current.addEventListener('message', handleMessage);
        
        console.log(`[CrossTabSync] Initialized channel: ${channel}, tabId: ${tabId.current}`);
        
        // Send initial heartbeat
        sendHeartbeat();
        
        // Setup periodic heartbeat
        const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30 seconds
        
        // Handle page unload
        const handleBeforeUnload = () => {
          sendMessage({ type: 'tab_closing' });
          broadcastChannel.current?.close();
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          clearInterval(heartbeatInterval);
          window.removeEventListener('beforeunload', handleBeforeUnload);
          
          if (broadcastChannel.current) {
            sendMessage({ type: 'tab_closing' });
            broadcastChannel.current.removeEventListener('message', handleMessage);
            broadcastChannel.current.close();
          }
        };
      } catch (error) {
        console.warn('[CrossTabSync] Failed to initialize BroadcastChannel:', error);
      }
    } else {
      console.warn('[CrossTabSync] BroadcastChannel not supported');
    }
  }, [channel, handleMessage, sendHeartbeat, sendMessage, onTabsChange]);

  return {
    sendMessage,
    tabId: tabId.current,
    isSupported: typeof BroadcastChannel !== 'undefined'
  };
};
