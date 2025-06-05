
import { useState, useCallback } from 'react';

export interface BatchUpdate {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}

export interface UseBatchUpdatesResult {
  pendingUpdates: BatchUpdate[];
  addUpdate: (update: Omit<BatchUpdate, 'id' | 'timestamp'>) => void;
  removeUpdate: (id: string) => void;
  processBatch: () => Promise<void>;
  clearBatch: () => void;
}

export const useBatchUpdates = (): UseBatchUpdatesResult => {
  const [pendingUpdates, setPendingUpdates] = useState<BatchUpdate[]>([]);

  const addUpdate = useCallback((update: Omit<BatchUpdate, 'id' | 'timestamp'>) => {
    const batchUpdate: BatchUpdate = {
      ...update,
      id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };
    
    setPendingUpdates(prev => [...prev, batchUpdate]);
  }, []);

  const removeUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== id));
  }, []);

  const processBatch = useCallback(async () => {
    // Mock batch processing - replace with actual implementation
    console.log('Processing batch of', pendingUpdates.length, 'updates');
    
    // Clear after processing
    setPendingUpdates([]);
  }, [pendingUpdates]);

  const clearBatch = useCallback(() => {
    setPendingUpdates([]);
  }, []);

  return {
    pendingUpdates,
    addUpdate,
    removeUpdate,
    processBatch,
    clearBatch
  };
};

export default useBatchUpdates;
