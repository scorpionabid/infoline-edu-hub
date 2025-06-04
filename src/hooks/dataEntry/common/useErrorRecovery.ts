import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface QueuedOperation {
  id: string;
  type: 'save' | 'submit' | 'import' | 'export';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata?: {
    categoryId?: string;
    schoolId?: string;
    userId?: string;
    description?: string;
  };
}

interface NetworkStatus {
  isOnline: boolean;
  downSince?: number;
  lastSuccessfulRequest?: number;
  consecutiveFailures: number;
}

interface UseErrorRecoveryOptions {
  enableOfflineQueue?: boolean;
  maxQueueSize?: number;
  defaultMaxRetries?: number;
  retryDelays?: number[]; // exponential backoff delays in ms
  onQueueChange?: (queue: QueuedOperation[]) => void;
  onNetworkStatusChange?: (status: NetworkStatus) => void;
}

export const useErrorRecovery = (options: UseErrorRecoveryOptions = {}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const {
    enableOfflineQueue = true,
    maxQueueSize = 50,
    defaultMaxRetries = 3,
    retryDelays = [1000, 2000, 5000, 10000, 30000], // Progressive delays
    onQueueChange,
    onNetworkStatusChange
  } = options;

  // State management
  const [offlineQueue, setOfflineQueue] = useState<QueuedOperation[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastSuccessfulRequest: Date.now(),
    consecutiveFailures: 0
  });
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  // Refs for managing timers and persistence
  const queueProcessorRef = useRef<NodeJS.Timeout | null>(null);
  const networkCheckRef = useRef<NodeJS.Timeout | null>(null);
  const persistenceKey = 'infoline_error_recovery_queue';

  // Load persisted queue on mount
  useEffect(() => {
    if (enableOfflineQueue) {
      try {
        const saved = localStorage.getItem(persistenceKey);
        if (saved) {
          const parsedQueue = JSON.parse(saved) as QueuedOperation[];
          // Filter out old operations (older than 24 hours)
          const validQueue = parsedQueue.filter(op => 
            Date.now() - op.timestamp < 24 * 60 * 60 * 1000
          );
          setOfflineQueue(validQueue);
        }
      } catch (error) {
        console.warn('Failed to load persisted queue:', error);
      }
    }
  }, [enableOfflineQueue]);

  // Persist queue changes
  useEffect(() => {
    if (enableOfflineQueue) {
      try {
        localStorage.setItem(persistenceKey, JSON.stringify(offlineQueue));
        onQueueChange?.(offlineQueue);
      } catch (error) {
        console.warn('Failed to persist queue:', error);
      }
    }
  }, [offlineQueue, enableOfflineQueue, onQueueChange]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      
      setNetworkStatus(prev => {
        const newStatus = {
          isOnline: true,
          lastSuccessfulRequest: Date.now(),
          consecutiveFailures: 0,
          downSince: undefined
        };
        onNetworkStatusChange?.(newStatus);
        return newStatus;
      });

      // Show connection restored notification if was offline
      if (!networkStatus.isOnline) {
        toast({
          title: t('connectionRestored') || 'Connection Restored',
          description: t('retryingPendingOperations') || 'Retrying pending operations',
          duration: 3000
        });
        
        // Start processing queue after a short delay
        setTimeout(() => processQueue(), 1000);
      }
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      
      setNetworkStatus(prev => {
        const newStatus = {
          ...prev,
          isOnline: false,
          downSince: prev.downSince || Date.now()
        };
        onNetworkStatusChange?.(newStatus);
        return newStatus;
      });

      toast({
        title: t('connectionLost') || 'Connection Lost',
        description: t('operationsWillBeQueuedForRetry') || 'Operations will be queued for retry',
        variant: 'destructive',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic network health check
    const checkNetworkHealth = () => {
      // Simple connectivity test using fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch('/api/health', { 
        method: 'HEAD', 
        signal: controller.signal,
        cache: 'no-cache'
      })
        .then(() => {
          clearTimeout(timeoutId);
          if (!networkStatus.isOnline) {
            handleOnline();
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          if (networkStatus.isOnline) {
            handleOffline();
          }
        });
    };

    networkCheckRef.current = setInterval(checkNetworkHealth, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkCheckRef.current) {
        clearInterval(networkCheckRef.current);
      }
    };
  }, [networkStatus.isOnline, toast, t, onNetworkStatusChange]);

  // Queue an operation for retry
  const queueOperation = useCallback((operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    if (!enableOfflineQueue) {
      console.warn('Offline queue is disabled');
      return null;
    }

    // Check queue size limit
    if (offlineQueue.length >= maxQueueSize) {
      console.warn('Queue size limit reached, removing oldest operation');
      setOfflineQueue(prev => prev.slice(1));
    }

    const queuedOp: QueuedOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: operation.maxRetries || defaultMaxRetries
    };

    console.log('Queueing operation:', queuedOp);
    
    setOfflineQueue(prev => [...prev, queuedOp].sort((a, b) => {
      // Sort by priority and timestamp
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    }));

    toast({
      title: t('operationQueued') || 'Operation Queued',
      description: t('operationWillRetryWhenConnected') || 'Operation will retry when connected',
      duration: 3000
    });

    return queuedOp.id;
  }, [enableOfflineQueue, offlineQueue.length, maxQueueSize, defaultMaxRetries, toast, t]);

  // Remove operation from queue
  const removeFromQueue = useCallback((operationId: string) => {
    setOfflineQueue(prev => prev.filter(op => op.id !== operationId));
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    setOfflineQueue([]);
    if (queueProcessorRef.current) {
      clearTimeout(queueProcessorRef.current);
    }
  }, []);

  // Process queued operations
  const processQueue = useCallback(async () => {
    if (!networkStatus.isOnline || isProcessingQueue || offlineQueue.length === 0) {
      return;
    }

    console.log('Processing offline queue:', offlineQueue.length, 'operations');
    setIsProcessingQueue(true);

    // Process operations one by one to avoid overwhelming the server
    for (const operation of offlineQueue) {
      try {
        console.log('Processing operation:', operation.id, operation.type);
        
        // Execute the operation based on type
        let success = false;
        
        switch (operation.type) {
          case 'save':
            // Re-execute save operation
            success = await retryOperation(operation);
            break;
          case 'submit':
            // Re-execute submit operation
            success = await retryOperation(operation);
            break;
          case 'import':
            // Re-execute import operation
            success = await retryOperation(operation);
            break;
          case 'export':
            // Re-execute export operation
            success = await retryOperation(operation);
            break;
          default:
            console.warn('Unknown operation type:', operation.type);
        }

        if (success) {
          console.log('Operation completed successfully:', operation.id);
          removeFromQueue(operation.id);
          
          // Update network status on success
          setNetworkStatus(prev => ({
            ...prev,
            lastSuccessfulRequest: Date.now(),
            consecutiveFailures: 0
          }));
        } else {
          // Increment retry count
          setOfflineQueue(prev => prev.map(op => 
            op.id === operation.id 
              ? { ...op, retryCount: op.retryCount + 1 }
              : op
          ));

          // Remove if max retries reached
          if (operation.retryCount >= operation.maxRetries) {
            console.error('Max retries reached for operation:', operation.id);
            removeFromQueue(operation.id);
            
            toast({
              title: t('operationFailed') || 'Operation Failed',
              description: t('maxRetriesReached') || 'Maximum retries reached',
              variant: 'destructive'
            });
          }
        }

        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error processing queued operation:', error);
        
        // Update failure count
        setNetworkStatus(prev => ({
          ...prev,
          consecutiveFailures: prev.consecutiveFailures + 1
        }));
      }
    }

    setIsProcessingQueue(false);

    // Schedule next processing if there are still items in queue
    if (offlineQueue.length > 0) {
      queueProcessorRef.current = setTimeout(() => {
        processQueue();
      }, 10000); // Retry after 10 seconds
    }
  }, [networkStatus.isOnline, isProcessingQueue, offlineQueue, removeFromQueue, toast, t]);

  // Retry individual operation with exponential backoff
  const retryOperation = async (operation: QueuedOperation): Promise<boolean> => {
    const delay = retryDelays[Math.min(operation.retryCount, retryDelays.length - 1)];
    
    console.log(`Retrying operation ${operation.id} (attempt ${operation.retryCount + 1}) after ${delay}ms`);
    
    // Wait for backoff delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      // Here you would implement the actual retry logic based on operation type
      // For now, we'll simulate success/failure
      
      // Simulate API call success rate (80% for demo)
      const success = Math.random() > 0.2;
      
      if (success) {
        console.log('Retry successful for operation:', operation.id);
        return true;
      } else {
        console.log('Retry failed for operation:', operation.id);
        return false;
      }
      
    } catch (error) {
      console.error('Retry error for operation:', operation.id, error);
      return false;
    }
  };

  // Manual retry trigger
  const retryNow = useCallback(async () => {
    if (networkStatus.isOnline && !isProcessingQueue) {
      await processQueue();
    }
  }, [networkStatus.isOnline, isProcessingQueue, processQueue]);

  // Check if specific operation type can be retried
  const canRetry = useCallback((operationType: string): boolean => {
    return networkStatus.isOnline && !isProcessingQueue;
  }, [networkStatus.isOnline, isProcessingQueue]);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const stats = {
      total: offlineQueue.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      oldestOperation: offlineQueue.length > 0 ? 
        Math.min(...offlineQueue.map(op => op.timestamp)) : null
    };

    offlineQueue.forEach(op => {
      stats.byType[op.type] = (stats.byType[op.type] || 0) + 1;
      stats.byPriority[op.priority] = (stats.byPriority[op.priority] || 0) + 1;
    });

    return stats;
  }, [offlineQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueProcessorRef.current) {
        clearTimeout(queueProcessorRef.current);
      }
      if (networkCheckRef.current) {
        clearInterval(networkCheckRef.current);
      }
    };
  }, []);

  return {
    // Queue management
    queueOperation,
    removeFromQueue,
    clearQueue,
    processQueue,
    retryNow,
    
    // Status information
    networkStatus,
    isOnline: networkStatus.isOnline,
    offlineQueue,
    isProcessingQueue,
    queueSize: offlineQueue.length,
    
    // Utilities
    canRetry,
    getQueueStats,
    
    // Queue statistics for UI
    queueStats: getQueueStats()
  };
};