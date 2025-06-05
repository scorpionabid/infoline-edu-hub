
import { useState, useCallback } from 'react';

export interface ConflictData {
  id: string;
  localValue: any;
  remoteValue: any;
  timestamp: Date;
}

export interface UseConflictResolutionResult {
  conflicts: ConflictData[];
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote' | 'merge') => void;
  addConflict: (conflict: ConflictData) => void;
  clearConflicts: () => void;
}

export const useConflictResolution = (): UseConflictResolutionResult => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);

  const resolveConflict = useCallback((conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
  }, []);

  const addConflict = useCallback((conflict: ConflictData) => {
    setConflicts(prev => [...prev, conflict]);
  }, []);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  return {
    conflicts,
    resolveConflict,
    addConflict,
    clearConflicts
  };
};

export default useConflictResolution;
