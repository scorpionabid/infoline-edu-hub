
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { createDeadlineNotification } from '@/services/notificationService';
import { isDeadlineApproaching, isDeadlinePassed } from '@/utils/date';

export const useDeadlineNotifications = (checkIntervalMinutes = 60) => {
  const { user } = useAuth();
  
  const checkDeadlines = useCallback(async () => {
    if (!user) return;
    
    try {
      // Bütün kateqoriyaları əldə et
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline')
        .not('deadline', 'is', null);
      
      if (categoriesError) throw categoriesError;
      
      if (!categories || categories.length === 0) return;
      
      // Mövcud bildirişləri yoxla
      const { data: existingNotifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('related_entity_id, type')
        .eq('user_id', user.id)
        .eq('type', 'deadline')
        .in('related_entity_id', categories.map(cat => cat.id));
      
      if (notificationsError) throw notificationsError;
      
      const existingNotificationMap = new Map();
      
      if (existingNotifications) {
        existingNotifications.forEach(notification => {
          existingNotificationMap.set(notification.related_entity_id, true);
        });
      }
      
      // Hər bir kateqoriya üçün son tarix bildirişini yoxla
      for (const category of categories) {
        if (!category.deadline) continue;
        
        const deadline = new Date(category.deadline);
        
        // Əgər son tarix yaxınlaşırsa və bildiriş hələ mövcud deyilsə
        if (isDeadlineApproaching(deadline) && !existingNotificationMap.has(category.id)) {
          await createDeadlineNotification(
            user.id,
            category.name,
            category.deadline,
            category.id,
            true
          );
        }
        
        // Əgər son tarix keçibsə və bildiriş hələ mövcud deyilsə
        if (isDeadlinePassed(deadline) && !existingNotificationMap.has(category.id)) {
          await createDeadlineNotification(
            user.id,
            category.name,
            category.deadline,
            category.id,
            false
          );
        }
      }
    } catch (error) {
      console.error('Son tarix bildirişləri yoxlanarkən xəta:', error);
    }
  }, [user]);
  
  useEffect(() => {
    if (!user) return;
    
    // İlk dəfə yoxla
    checkDeadlines();
    
    // Müəyyən intervalla yoxlamanı təkrarla
    const intervalId = setInterval(checkDeadlines, checkIntervalMinutes * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user, checkDeadlines, checkIntervalMinutes]);
  
  return { checkDeadlines };
};
