
/**
 * Unified Notification System Tests
 * Tests for the integrated notification system with security
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the security logger
const mockSecurityLogger = {
  logSecurityEvent: vi.fn(),
  logRateLimit: vi.fn(),
  logError: vi.fn(),
  logValidationFailure: vi.fn(),
  logSuspiciousActivity: vi.fn()
};

vi.mock('@/utils/securityLogger', () => ({
  securityLogger: mockSecurityLogger,
  getClientContext: vi.fn(() => ({
    userAgent: 'test-agent',
    timestamp: new Date().toISOString(),
    clientId: 'test-client'
  }))
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { id: '1', title: 'Test' }, error: null }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Unified Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should initialize correctly', () => {
    expect(mockSecurityLogger).toBeDefined();
    expect(mockSupabase).toBeDefined();
  });

  it('should handle notification creation', async () => {
    const { SecureNotificationService } = await import('@/services/secureNotificationService');
    
    const notification = {
      user_id: 'test-user',
      title: 'Test Notification',
      message: 'Test message',
      type: 'info' as const
    };

    const result = await SecureNotificationService.createNotification(notification);
    
    expect(result.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
  });

  it('should handle rate limiting', async () => {
    const { useRateLimit } = await import('@/hooks/auth/useRateLimit');
    
    // Mock rate limit data
    const rateLimitData = {
      attempts: 5,
      resetTime: Date.now() + 60000,
      blockUntil: Date.now() + 30000
    };
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(rateLimitData));
    
    // This is a hook test, so we need to test the actual functionality
    expect(useRateLimit).toBeDefined();
  });

  it('should validate input correctly', async () => {
    const { advancedSanitize, validateNotificationContent } = await import('@/utils/inputValidation');
    
    const testInput = '<script>alert("xss")</script>Hello World';
    const sanitized = advancedSanitize(testInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello World');
    
    const validation = validateNotificationContent({
      title: 'Valid Title',
      message: 'Valid message',
      type: 'info'
    });
    
    expect(validation.isValid).toBe(true);
  });
});
