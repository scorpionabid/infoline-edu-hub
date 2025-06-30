import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/api/notificationService';
import type { DeadlineNotificationData } from '@/types/notifications';

/**
 * Deadline Scheduler for Automated Notifications
 * Kategoriyaların son tarixlərinə görə avtomatik xəbərdarlıq sistemi
 */
export class DeadlineScheduler {
  
  /**
   * Check and send deadline reminders for all active categories
   */
  static async checkAndSendDeadlineReminders(): Promise<void> {
    try {
      console.log('[DeadlineScheduler] Checking deadline reminders...');
      
      // Get all active categories with deadlines
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, assignment')
        .eq('status', 'active')
        .not('deadline', 'is', null)
        .gte('deadline', new Date().toISOString()); // Only future deadlines

      if (categoriesError) {
        console.error('Error fetching categories for deadline check:', categoriesError);
        return;
      }

      if (!categories || categories.length === 0) {
        console.log('[DeadlineScheduler] No active categories with deadlines found');
        return;
      }

      const now = new Date();
      
      for (const category of categories) {
        const deadline = new Date(category.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Send reminders for 3 days and 1 day before deadline
        if (daysRemaining === 3 || daysRemaining === 1) {
          await this.sendCategoryDeadlineReminder(category, daysRemaining);
        }
      }

    } catch (error) {
      console.error('[DeadlineScheduler] Error in deadline check:', error);
    }
  }

  /**
   * Send deadline reminder for a specific category
   */
  private static async sendCategoryDeadlineReminder(
    category: { id: string; name: string; deadline: string; assignment: string },
    daysRemaining: number
  ): Promise<void> {
    try {
      console.log(`[DeadlineScheduler] Sending reminder for category ${category.name}, ${daysRemaining} days remaining`);

      let schoolIds: string[] = [];

      if (category.assignment === 'all') {
        // Get all schools
        const { data: schools, error } = await supabase
          .from('schools')
          .select('id')
          .eq('status', 'active');

        if (error) throw error;
        schoolIds = schools?.map(s => s.id) || [];
      } else if (category.assignment === 'sectors') {
        // Get schools that have sector admins (sectors only assignment)
        const { data: schools, error } = await supabase
          .from('schools')
          .select('id')
          .eq('status', 'active')
          .not('sector_id', 'is', null);

        if (error) throw error;
        schoolIds = schools?.map(s => s.id) || [];
      }

      if (schoolIds.length === 0) {
        console.log(`[DeadlineScheduler] No schools found for category ${category.name}`);
        return;
      }

      // Check which schools haven't completed this category yet
      const incompleteSchools = await this.getIncompleteSchools(category.id, schoolIds);
      
      if (incompleteSchools.length === 0) {
        console.log(`[DeadlineScheduler] All schools completed category ${category.name}`);
        return;
      }

      // Create deadline notification data
      const notificationData: DeadlineNotificationData = {
        categoryName: category.name,
        categoryId: category.id,
        deadline: category.deadline,
        daysRemaining,
        schoolIds: incompleteSchools
      };

      // Send notifications
      const notifications = await NotificationService.createDeadlineNotifications(notificationData);
      
      console.log(`[DeadlineScheduler] Sent ${notifications.length} deadline reminders for category ${category.name}`);

    } catch (error) {
      console.error(`[DeadlineScheduler] Error sending reminder for category ${category.name}:`, error);
    }
  }

  /**
   * Get schools that haven't completed the category
   */
  private static async getIncompleteSchools(categoryId: string, schoolIds: string[]): Promise<string[]> {
    try {
      // Get required columns for this category
      const { data: requiredColumns, error: columnsError } = await supabase
        .from('columns')
        .select('id')
        .eq('category_id', categoryId)
        .eq('is_required', true)
        .eq('status', 'active');

      if (columnsError) throw columnsError;

      if (!requiredColumns || requiredColumns.length === 0) {
        // No required columns, all schools are considered complete
        return [];
      }

      const requiredColumnIds = requiredColumns.map(c => c.id);
      const incompleteSchools: string[] = [];

      // Check each school's completion status
      for (const schoolId of schoolIds) {
        const { data: entries, error: entriesError } = await supabase
          .from('data_entries')
          .select('column_id')
          .eq('school_id', schoolId)
          .in('column_id', requiredColumnIds)
          .eq('status', 'approved');

        if (entriesError) {
          console.error(`Error checking completion for school ${schoolId}:`, entriesError);
          continue;
        }

        const completedColumnIds = entries?.map(e => e.column_id) || [];
        const isComplete = requiredColumnIds.every(colId => completedColumnIds.includes(colId));

        if (!isComplete) {
          incompleteSchools.push(schoolId);
        }
      }

      return incompleteSchools;

    } catch (error) {
      console.error('Error getting incomplete schools:', error);
      return schoolIds; // Return all schools if error
    }
  }

  /**
   * Schedule deadline reminders (can be called from cron job or interval)
   */
  static startDeadlineScheduler(intervalMinutes: number = 60): NodeJS.Timeout {
    console.log(`[DeadlineScheduler] Starting deadline scheduler (every ${intervalMinutes} minutes)`);
    
    // Run immediately
    this.checkAndSendDeadlineReminders();
    
    // Then run on interval
    return setInterval(() => {
      this.checkAndSendDeadlineReminders();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Send immediate deadline reminder for specific category
   */
  static async sendImmediateDeadlineReminder(categoryId: string): Promise<boolean> {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .select('id, name, deadline, assignment')
        .eq('id', categoryId)
        .eq('status', 'active')
        .single();

      if (error || !category || !category.deadline) {
        console.error('Category not found or no deadline:', error);
        return false;
      }

      const deadline = new Date(category.deadline);
      const now = new Date();
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));

      await this.sendCategoryDeadlineReminder(category, daysRemaining);
      return true;

    } catch (error) {
      console.error('Error sending immediate deadline reminder:', error);
      return false;
    }
  }
}

export default DeadlineScheduler;
