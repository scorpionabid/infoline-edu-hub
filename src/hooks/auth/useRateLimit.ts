
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RATE_LIMITS } from '@/config/security';

interface RateLimitState {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime?: Date;
}

export const useRateLimit = (actionType: keyof typeof RATE_LIMITS) => {
  const [state, setState] = useState<RateLimitState>({
    isBlocked: false,
    remainingAttempts: RATE_LIMITS[actionType].max,
  });

  const checkRateLimit = useCallback(async (identifier?: string): Promise<boolean> => {
    try {
      const userIdentifier = identifier || (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        user_identifier: userIdentifier,
        action_type: actionType,
        max_attempts: RATE_LIMITS[actionType].max,
        window_minutes: RATE_LIMITS[actionType].windowMinutes,
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to avoid blocking legitimate users
      }

      const isAllowed = data as boolean;
      
      if (!isAllowed) {
        const resetTime = new Date();
        resetTime.setMinutes(resetTime.getMinutes() + RATE_LIMITS[actionType].windowMinutes);
        
        setState({
          isBlocked: true,
          remainingAttempts: 0,
          resetTime,
        });
      }

      return isAllowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  }, [actionType]);

  const recordAttempt = useCallback(async (identifier?: string) => {
    try {
      const userIdentifier = identifier || (await supabase.auth.getUser()).data.user?.id || 'anonymous';
      
      await supabase.from('audit_logs').insert({
        action: actionType,
        entity_type: 'rate_limit',
        user_id: userIdentifier !== 'anonymous' ? userIdentifier : null,
        ip_address: 'client', // In a real app, you'd get this from the server
      });
    } catch (error) {
      console.error('Failed to record rate limit attempt:', error);
    }
  }, [actionType]);

  return {
    ...state,
    checkRateLimit,
    recordAttempt,
  };
};
