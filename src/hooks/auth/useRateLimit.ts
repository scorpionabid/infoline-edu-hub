
import { useState, useCallback } from 'react';

export const useRateLimit = (key: string, maxAttempts: number, windowMs: number) => {
  const [attempts, setAttempts] = useState(0);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  const isBlocked = attempts >= maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - attempts);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    if (isBlocked && resetTime && new Date() < resetTime) {
      return false;
    }
    
    if (resetTime && new Date() >= resetTime) {
      setAttempts(0);
      setResetTime(null);
    }
    
    return !isBlocked;
  }, [isBlocked, resetTime]);

  const recordAttempt = useCallback(async (): Promise<void> => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= maxAttempts) {
      setResetTime(new Date(Date.now() + windowMs));
    }
  }, [attempts, maxAttempts, windowMs]);

  return {
    isBlocked,
    remainingAttempts,
    resetTime,
    checkRateLimit,
    // recordAttempt
  };
};
