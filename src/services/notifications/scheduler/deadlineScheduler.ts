
import { supabase } from '@/integrations/supabase/client';
import { notificationManager } from '@/notifications/notificationManager';
import { toast } from 'sonner';
import type { NotificationPriority } from '@/types/notification';

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

interface DeadlineNotificationData {
  categoryId: string;
  categoryName: string;
  deadline: Date;
  daysLeft: number;
  assignment: string;
}

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

      // Create notifications for each user
      for (const user of targetUsers) {
        await this.createDeadlineNotification({
          categoryId: category.id,
          categoryName: category.name,
          deadline,
          daysLeft,
          assignment: category.assignment
        }, user);
      }

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
        case 'all':
          // Get all active users
          query = query.eq('status', 'active');
          break;
        case 'school_admin':
          // Get school admins
          query = query
            .eq('status', 'active')
            .in('id', 
              supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'schooladmin')
            );
          break;
        case 'sector_admin':
          // Get sector admins
          query = query
            .eq('status', 'active')
            .in('id', 
              supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'sectoradmin')
            );
          break;
        case 'region_admin':
          // Get region admins
          query = query
            .eq('status', 'active')
            .in('id', 
              supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'regionadmin')
            );
          break;
        default:
          console.warn(`Unknown assignment type: ${assignment}`);
          return [];
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

  private async createDeadlineNotification(
    deadlineData: DeadlineNotificationData,
    user: UserData
  ): Promise<void> {
    try {
      const title = `Son tarix xəbərdarlığı: ${deadlineData.categoryName}`;
      const message = `${deadlineData.categoryName} kateqoriyası üçün ${deadlineData.daysLeft} gün qalıb`;

      // Add notification to the system
      notificationManager.add({
        user_id: user.id,
        title,
        message,
        type: 'deadline',
        priority: this.calculatePriority(deadlineData.daysLeft),
        is_read: false,
        created_at: new Date().toISOString(),
        related_entity_id: deadlineData.categoryId,
        related_entity_type: 'category',
        metadata: {
          daysLeft: deadlineData.daysLeft,
          deadline: deadlineData.deadline.toISOString(),
          assignment: deadlineData.assignment
        }
      });

      console.log(`Created deadline notification for user ${user.full_name} (${user.email})`);

    } catch (error) {
      console.error('Error creating deadline notification:', error);
    }
  }

  private calculatePriority(daysLeft: number): NotificationPriority {
    if (daysLeft <= 1) return 'critical';
    if (daysLeft <= 3) return 'high';
    if (daysLeft <= 7) return 'normal';
    return 'low';
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

    console.log('✅ Deadline scheduler started');
  }

  stopScheduler(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    console.log('🛑 Deadline scheduler stopped');
  }
}

export const deadlineScheduler = DeadlineScheduler.getInstance();
