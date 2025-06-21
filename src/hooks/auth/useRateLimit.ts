
import { useState, useCallback } from 'react';
import { securityLogger, getClientContext } from '@/utils/securityLogger';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
}

export const useRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000
) => {
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(`rate_limit_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const isBlocked = parsed.attempts >= maxAttempts && (now - parsed.lastAttempt) < windowMs;
      return {
        attempts: isBlocked ? parsed.attempts : 0,
        lastAttempt: parsed.lastAttempt,
        isBlocked
      };
    }
    return { attempts: 0, lastAttempt: 0, isBlocked: false };
  });

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    const timeSinceLastAttempt = now - state.lastAttempt;
    
    if (state.attempts >= maxAttempts && timeSinceLastAttempt < windowMs) {
      return false;
    }
    
    if (timeSinceLastAttempt >= windowMs) {
      setState({ attempts: 0, lastAttempt: 0, isBlocked: false });
      localStorage.removeItem(`rate_limit_${key}`);
      return true;
    }
    
    return state.attempts < maxAttempts;
  }, [key, maxAttempts, windowMs, state]);

  const recordAttempt = useCallback(async () => {
    const now = Date.now();
    const newAttempts = state.attempts + 1;
    const newState = {
      attempts: newAttempts,
      lastAttempt: now,
      isBlocked: newAttempts >= maxAttempts
    };
    
    setState(newState);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(newState));
    
    if (newState.isBlocked) {
      securityLogger.logRateLimit('rate_limit_exceeded', getClientContext());
    }
  }, [key, maxAttempts, state.attempts]);

  const remainingAttempts = Math.max(0, maxAttempts - state.attempts);
  const resetTime = state.isBlocked ? new Date(state.lastAttempt + windowMs) : null;

  return {
    isBlocked: state.isBlocked,
    remainingAttempts,
    resetTime,
    checkRateLimit,
    recordAttempt
  };
};
