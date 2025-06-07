
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

interface DeadlineAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  deadline: string;
  daysLeft: number;
  status: 'upcoming' | 'overdue' | 'critical';
}

export const useDeadlineManagement = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [deadlineAlerts, setDeadlineAlerts] = useState<DeadlineAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check for approaching deadlines
  const checkDeadlines = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, deadline')
        .not('deadline', 'is', null);

      if (error) throw error;

      const alerts: DeadlineAlert[] = [];
      const now = new Date();

      categories?.forEach(category => {
        if (category.deadline) {
          const deadline = new Date(category.deadline);
          const diffTime = deadline.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: 'upcoming' | 'overdue' | 'critical' = 'upcoming';
          
          if (diffDays < 0) {
            status = 'overdue';
          } else if (diffDays <= 3) {
            status = 'critical';
          }

          if (diffDays <= 7 || diffDays < 0) {
            alerts.push({
              id: category.id,
              categoryId: category.id,
              categoryName: category.name,
              deadline: category.deadline,
              daysLeft: diffDays,
              status
            });
          }
        }
      });

      setDeadlineAlerts(alerts);

      // Show critical alerts
      alerts
        .filter(alert => alert.status === 'critical' || alert.status === 'overdue')
        .forEach(alert => {
          toast({
            title: t('deadlineAlert'),
            description: alert.status === 'overdue' 
              ? t('deadlinePassedMessage', { category: alert.categoryName })
              : t('deadlineApproachingMessage', { category: alert.categoryName, days: alert.daysLeft }),
            variant: alert.status === 'overdue' ? 'destructive' : 'default',
          });
        });

    } catch (error) {
      console.error('Error checking deadlines:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  // Auto-approve entries on deadline - using direct query instead of RPC
  const autoApproveOnDeadline = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: null // or get current user ID
        })
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: t('autoApprovalCompleted'),
        description: t('pendingEntriesAutoApproved'),
      });

    } catch (error) {
      console.error('Error auto-approving entries:', error);
      toast({
        title: t('error'),
        description: t('autoApprovalFailed'),
        variant: 'destructive'
      });
    }
  }, [toast, t]);

  // Get pending entries count for a category
  const getPendingEntriesCount = useCallback(async (categoryId: string) => {
    try {
      const { count, error } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting pending entries count:', error);
      return 0;
    }
  }, []);

  // Setup automatic checking
  useEffect(() => {
    checkDeadlines();
    
    // Check deadlines every hour
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  return {
    deadlineAlerts,
    isLoading,
    checkDeadlines,
    autoApproveOnDeadline,
    getPendingEntriesCount
  };
};
