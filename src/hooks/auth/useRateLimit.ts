
/**
 * Enhanced Rate Limiting Hook
 * Advanced rate limiting for authentication and security operations
 */

import { useState, useEffect, useCallback } from 'react';
import { securityLogger, getClientContext } from '@/utils/securityLogger';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime: Date | null;
  attempts: number;
}

interface RateLimitStorage {
  attempts: number;
  resetTime: number;
  blockUntil?: number;
}

export const useRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  blockDurationMs: number = 30 * 60 * 1000 // 30 minutes
) => {
  const [state, setState] = useState<RateLimitState>({
    isBlocked: false,
    remainingAttempts: maxAttempts,
    resetTime: null,
    attempts: 0
  });

  const storageKey = `rate_limit_${key}`;

  // Load state from localStorage
  const loadState = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return {
          attempts: 0,
          resetTime: Date.now() + windowMs,
          blockUntil: undefined
        };
      }

      const data: RateLimitStorage = JSON.parse(stored);
      const now = Date.now();

      // Check if blocked
      if (data.blockUntil && now < data.blockUntil) {
        return {
          ...data,
          isBlocked: true
        };
      }

      // Check if window has expired
      if (now > data.resetTime) {
        return {
          attempts: 0,
          resetTime: now + windowMs,
          blockUntil: undefined
        };
      }

      return data;
    } catch (error) {
      console.error('Error loading rate limit state:', error);
      return {
        attempts: 0,
        resetTime: Date.now() + windowMs,
        blockUntil: undefined
      };
    }
  }, [storageKey, windowMs]);

  // Save state to localStorage
  const saveState = useCallback((data: RateLimitStorage) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving rate limit state:', error);
    }
  }, [storageKey]);

  // Update React state from storage
  const updateState = useCallback(() => {
    const data = loadState();
    const now = Date.now();
    
    const isBlocked = Boolean(data.blockUntil && now < data.blockUntil);
    const resetTime = isBlocked && data.blockUntil 
      ? new Date(data.blockUntil)
      : new Date(data.resetTime);

    setState({
      isBlocked,
      remainingAttempts: Math.max(0, maxAttempts - data.attempts),
      resetTime,
      attempts: data.attempts
    });
  }, [loadState, maxAttempts]);

  // Initialize state
  useEffect(() => {
    updateState();
  }, [updateState]);

  // Auto-refresh state
  useEffect(() => {
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  // Check if operation is allowed
  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    const data = loadState();
    const now = Date.now();

    // Check if blocked
    if (data.blockUntil && now < data.blockUntil) {
      securityLogger.logRateLimit('blocked_attempt', {
        ...getClientContext(),
        key,
        severity: 'high'
      });
      return false;
    }

    // Check if window has expired
    if (now > data.resetTime) {
      const newData = {
        attempts: 0,
        resetTime: now + windowMs,
        blockUntil: undefined
      };
      saveState(newData);
      updateState();
      return true;
    }

    // Check if within limits
    if (data.attempts < maxAttempts) {
      return true;
    }

    // Block user
    const newData = {
      ...data,
      blockUntil: now + blockDurationMs
    };
    saveState(newData);
    updateState();

    securityLogger.logRateLimit('rate_limit_exceeded', {
      ...getClientContext(),
      key,
      attempts: data.attempts,
      severity: 'high'
    });

    return false;
  }, [loadState, saveState, updateState, key, maxAttempts, windowMs, blockDurationMs]);

  // Record failed attempt
  const recordAttempt = useCallback(async () => {
    const data = loadState();
    const now = Date.now();

    // Reset if window expired
    if (now > data.resetTime) {
      const newData = {
        attempts: 1,
        resetTime: now + windowMs,
        blockUntil: undefined
      };
      saveState(newData);
      updateState();
      return;
    }

    // Increment attempts
    const newAttempts = data.attempts + 1;
    let newData: RateLimitStorage = {
      ...data,
      attempts: newAttempts
    };

    // Block if exceeded
    if (newAttempts >= maxAttempts) {
      newData.blockUntil = now + blockDurationMs;
      
      securityLogger.logRateLimit('rate_limit_triggered', {
        ...getClientContext(),
        key,
        attempts: newAttempts,
        severity: 'high'
      });
    }

    saveState(newData);
    updateState();
  }, [loadState, saveState, updateState, key, maxAttempts, windowMs, blockDurationMs]);

  // Reset rate limit
  const reset = useCallback(() => {
    const newData = {
      attempts: 0,
      resetTime: Date.now() + windowMs,
      blockUntil: undefined
    };
    saveState(newData);
    updateState();

    securityLogger.logSecurityEvent('rate_limit_reset', {
      ...getClientContext(),
      key,
      severity: 'low'
    });
  }, [saveState, updateState, key, windowMs]);

  return {
    isBlocked: state.isBlocked,
    remainingAttempts: state.remainingAttempts,
    resetTime: state.resetTime,
    attempts: state.attempts,
    checkRateLimit,
    recordAttempt,
    reset
  };
};

export default useRateLimit;
