import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/api/notificationService';
import { toast } from 'sonner';
import type { DeadlineNotificationData } from '@/types/notifications';

interface UserData {
  id: string;
  full_name: string;
  email: string;
}

interface DeadlineCategory {
  id: string;
  name: string;
  deadline: string;
  assignment: string;
}

type NotificationPriority = 'normal' | 'high' | 'critical';

export class DeadlineScheduler {
  private static instance: DeadlineScheduler;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): DeadlineScheduler {
    if (!DeadlineScheduler.instance) {
      DeadlineScheduler.instance = new DeadlineScheduler();
    }
    return DeadlineScheduler.instance;
  }

  async scheduleDeadlineNotifications(): Promise<void> {
    try {
      console.log('🕒 Starting deadline notification scheduling...');
      
      // Get categories with upcoming deadlines
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, assignment')
        .not('deadline', 'is', null)
        .eq('status', 'active')
        .gte('deadline', new Date().toISOString());

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      if (!categories || categories.length === 0) {
        console.log('No upcoming deadlines found');
        return;
      }

      console.log(`Found ${categories.length} categories with upcoming deadlines`);

      // Process each category
      for (const category of categories) {
        await this.processDeadlineNotifications(category as DeadlineCategory);
      }

    } catch (error) {
      console.error('Error in deadline scheduling:', error);
      toast.error('Deadline notification scheduling failed');
    }
  }

  private async processDeadlineNotifications(category: DeadlineCategory): Promise<void> {
    try {
      const deadline = new Date(category.deadline);
      const now = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Only notify for deadlines within 30 days
      if (daysLeft > 30 || daysLeft < 0) {
        return;
      }

      console.log(`Processing deadline for category: ${category.name}, days left: ${daysLeft}`);

      // Get target users based on assignment
      const targetUsers = await this.getTargetUsers(category.assignment);
      
      if (!targetUsers || targetUsers.length === 0) {
        console.log(`No target users found for category: ${category.name}`);
        return;
      }

      // Create deadline notifications using real NotificationService
      const deadlineData: DeadlineNotificationData = {
        categoryName: category.name,
        categoryId: category.id,
        deadline: deadline.toISOString(),
        daysRemaining: daysLeft,
        schoolIds: [] // Will be populated based on assignment
      };

      // Get school IDs if assignment is school-specific
      if (category.assignment === 'school_admin') {
        const schoolIds = await this.getSchoolIdsForUsers(targetUsers.map(u => u.id));
        deadlineData.schoolIds = schoolIds;
      }

      // Use the unified NotificationService
      await NotificationService.createDeadlineNotifications(deadlineData);

      console.log(`Created ${targetUsers.length} deadline notifications for category: ${category.name}`);

    } catch (error) {
      console.error(`Error processing deadline for category ${category.name}:`, error);
    }
  }

  private async getTargetUsers(assignment: string): Promise<UserData[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email');

      // Filter based on assignment type
      switch (assignment) {
        case 'all': {
          // Get all active users
          query = query.eq('status', 'active');
          break; }
        case 'schools': {
          // Get school admins
          const { data: schoolAdminIds } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'schooladmin');
          
          if (schoolAdminIds && schoolAdminIds.length > 0) {
            const userIds = schoolAdminIds.map(r => r.user_id);
            query = query
              .eq('status', 'active')
              .in('id', userIds);
          } else {
            return [];
          }
          break; }
        case 'sectors': {
          // Get sector admins
          const { data: sectorAdminIds } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'sectoradmin');
          
          if (sectorAdminIds && sectorAdminIds.length > 0) {
            const userIds = sectorAdminIds.map(r => r.user_id);
            query = query
              .eq('status', 'active')
              .in('id', userIds);
          } else {
            return [];
          }
          break; }
        default:
          console.warn(`Unknown assignment type: ${assignment}, defaulting to all active users`);
          query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching target users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTargetUsers:', error);
      return [];
    }
  }

  private async getSchoolIdsForUsers(userIds: string[]): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('school_id')
        .eq('role', 'schooladmin')
        .in('user_id', userIds)
        .not('school_id', 'is', null);

      if (error) {
        console.error('Error fetching school IDs:', error);
        return [];
      }

      return data?.map(item => item.school_id).filter(Boolean) || [];
    } catch (error) {
      console.error('Error in getSchoolIdsForUsers:', error);
      return [];
    }
  }

  startScheduler(): void {
    // Clear existing interval
    this.stopScheduler();

    // Run immediately
    this.scheduleDeadlineNotifications();

    // Schedule to run every 6 hours
    const interval = setInterval(() => {
      this.scheduleDeadlineNotifications();
    }, 6 * 60 * 60 * 1000);

    this.intervals.set('main', interval);

    console.log('✅ Deadline scheduler started with real NotificationService');
  }

  stopScheduler(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    console.log('🛑 Deadline scheduler stopped');
  }

  // Manual trigger for testing
  async triggerDeadlineCheck(): Promise<void> {
    console.log('🔧 Manual deadline check triggered');
    await this.scheduleDeadlineNotifications();
  }
}

export const deadlineScheduler = DeadlineScheduler.getInstance();