
/**
 * Rate Limiting Hook for Authentication
 * Prevents brute force attacks and abuse
 */

import { useState, useEffect } from 'react';
import { checkRateLimit } from '@/config/security';

interface RateLimitResult {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime?: Date;
  checkRateLimit: () => Promise<boolean>;
  recordAttempt: () => Promise<void>;
}

export const useRateLimit = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);
  const [resetTime, setResetTime] = useState<Date | undefined>();

  const checkLimit = async (): Promise<boolean> => {
    const result = checkRateLimit(identifier, maxAttempts, windowMs);
    
    setIsBlocked(!result.allowed);
    setRemainingAttempts(result.remainingAttempts);
    setResetTime(result.resetTime);
    
    return result.allowed;
  };

  const recordAttempt = async (): Promise<void> => {
    await checkLimit();
  };

  useEffect(() => {
    // Check rate limit on mount
    checkLimit();
  }, [identifier]);

  return {
    isBlocked,
    remainingAttempts,
    resetTime,
    checkRateLimit: checkLimit,
    recordAttempt,
  };
};

export default useRateLimit;
