import { supabase } from '@/integrations/supabase/client';
import { EnhancedNotificationService } from '../enhancedNotificationService';
import { NotificationTemplateService } from '../templates/templateService';
import { NotificationPriority } from '@/types/notification';

export interface DeadlineCheckResult {
  processed: number;
  warnings3Days: number;
  warnings1Day: number;
  expired: number;
  errors: string[];
}

export interface DeadlineWarningType {
  type: '3_days' | '1_day' | 'expired';
  templateName: string;
  priority: NotificationPriority;
}

export interface JobResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface Category {
  id: string;
  name: string;
  deadline: string;
  status: string;
  assignment: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
}

/**
 * Deadline Scheduler Service
 * Manages automated deadline notifications and warnings
 */
export class DeadlineSchedulerService {
  
  // Deadline warning configurations
  private static readonly DEADLINE_WARNINGS: DeadlineWarningType[] = [
    {
      type: '3_days',
      templateName: NotificationTemplateService.TEMPLATES.DEADLINE_WARNING_3_DAYS,
      priority: 'high'
    },
    {
      type: '1_day',
      templateName: NotificationTemplateService.TEMPLATES.DEADLINE_WARNING_1_DAY,
      priority: 'critical'
    },
    {
      type: 'expired',
      templateName: NotificationTemplateService.TEMPLATES.DEADLINE_EXPIRED,
      priority: 'critical'
    }
  ];

  /**
   * Check for upcoming deadlines and send notifications
   */
  static async checkUpcomingDeadlines(): Promise<DeadlineCheckResult> {
    const result: DeadlineCheckResult = {
      processed: 0,
      warnings3Days: 0,
      warnings1Day: 0,
      expired: 0,
      errors: []
    };

    try {
      // Get all active categories with deadlines
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .not('deadline', 'is', null)
        .eq('status', 'active');

      if (categoriesError) {
        result.errors.push(`Categories fetch error: ${categoriesError.message}`);
        return result;
      }

      if (!categories || categories.length === 0) {
        return result;
      }

      const now = new Date();

      for (const category of categories) {
        try {
          const deadline = new Date(category.deadline);
          const timeDiff = deadline.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Check if we need to send warnings
          if (daysDiff === 3) {
            await this.sendDeadlineWarning('3_days', category, result);
            result.warnings3Days++;
          } else if (daysDiff === 1) {
            await this.sendDeadlineWarning('1_day', category, result);
            result.warnings1Day++;
          } else if (daysDiff <= 0) {
            await this.handleExpiredDeadline(category, result);
            result.expired++;
          }

          result.processed++;
        } catch (error) {
          result.errors.push(`Error processing category ${category.name}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`General error: ${error}`);
      return result;
    }
  }

  /**
   * Schedule deadline notifications for a specific category
   */
  static async scheduleDeadlineNotifications(categoryId: string): Promise<void> {
    try {
      // Get category details
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        throw new Error(`Category fetch error: ${categoryError.message}`);
      }

      if (!category.deadline) {
        throw new Error('Category has no deadline set');
      }

      const deadline = new Date(category.deadline);
      const warning3Days = new Date(deadline.getTime() - (3 * 24 * 60 * 60 * 1000));
      const warning1Day = new Date(deadline.getTime() - (1 * 24 * 60 * 60 * 1000));

      // Get users who should receive notifications
      const recipients = await this.getNotificationRecipients(category);

      if (recipients.length === 0) {
        console.log(`No recipients found for category ${category.name}`);
        return;
      }

      // Schedule 3-day warning
      if (warning3Days > new Date()) {
        await this.scheduleNotificationForUsers(
          recipients,
          NotificationTemplateService.TEMPLATES.DEADLINE_WARNING_3_DAYS,
          warning3Days,
          {
            category_id: category.id,
            category_name: category.name,
            deadline_date: deadline.toLocaleDateString('az-AZ'),
            days_left: 3
          }
        );
      }

      // Schedule 1-day warning
      if (warning1Day > new Date()) {
        await this.scheduleNotificationForUsers(
          recipients,
          NotificationTemplateService.TEMPLATES.DEADLINE_WARNING_1_DAY,
          warning1Day,
          {
            category_id: category.id,
            category_name: category.name,
            deadline_date: deadline.toLocaleDateString('az-AZ'),
            days_left: 1
          }
        );
      }

      console.log(`Scheduled deadline notifications for category: ${category.name}`);
    } catch (error) {
      console.error('Error scheduling deadline notifications:', error);
      throw error;
    }
  }

  /**
   * Send deadline warning to appropriate users
   */
  private static async sendDeadlineWarning(
    warningType: '3_days' | '1_day',
    category: Category,
    result: DeadlineCheckResult
  ): Promise<void> {
    try {
      // Check if we've already sent this warning today
      const today = new Date().toISOString().split('T')[0];
      const warningKey = `deadline_${warningType}_${category.id}_${today}`;

      // Check if notification was already sent today
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_entity_id', category.id)
        .eq('type', 'warning')
        .gte('created_at', `${today}T00:00:00Z`)
        .lte('created_at', `${today}T23:59:59Z`)
        .limit(1);

      if (existingNotifications && existingNotifications.length > 0) {
        console.log(`Warning already sent today for category ${category.name}`);
        return;
      }

      // Get users who should receive this warning
      const recipients = await this.getNotificationRecipients(category);

      if (recipients.length === 0) {
        result.errors.push(`No recipients found for category ${category.name}`);
        return;
      }

      // Get the warning configuration
      const warningConfig = this.DEADLINE_WARNINGS.find(w => w.type === warningType);
      if (!warningConfig) {
        result.errors.push(`Warning config not found for type: ${warningType}`);
        return;
      }

      // Prepare template data
      const templateData = {
        category_id: category.id,
        category_name: category.name,
        deadline_date: new Date(category.deadline).toLocaleDateString('az-AZ'),
        days_left: warningType === '3_days' ? 3 : 1,
        data_entry_url: `${window.location.origin}/data-entry/${category.id}`
      };

      // Create notifications using template
      const createResult = await EnhancedNotificationService.createFromTemplate(
        warningConfig.templateName,
        templateData,
        recipients.map(r => r.id)
      );

      if (!createResult.success) {
        result.errors.push(`Failed to create notifications: ${createResult.error}`);
        return;
      }

      // Send email notifications if enabled
      await this.sendEmailNotifications(recipients, warningConfig.templateName, templateData);

      console.log(`Sent ${warningType} deadline warning for category: ${category.name}`);
    } catch (error) {
      result.errors.push(`Error sending ${warningType} warning: ${error}`);
    }
  }

  /**
   * Handle expired deadline
   */
  private static async handleExpiredDeadline(
    category: Category,
    result: DeadlineCheckResult
  ): Promise<void> {
    try {
      // Check if we've already handled this expiration
      const today = new Date().toISOString().split('T')[0];

      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('related_entity_id', category.id)
        .eq('type', 'error')
        .gte('created_at', `${today}T00:00:00Z`)
        .limit(1);

      if (existingNotifications && existingNotifications.length > 0) {
        console.log(`Expiration already handled for category ${category.name}`);
        return;
      }

      // Get recipients
      const recipients = await this.getNotificationRecipients(category);

      if (recipients.length > 0) {
        // Send expiration notifications
        const templateData = {
          category_id: category.id,
          category_name: category.name,
          deadline_date: new Date(category.deadline).toLocaleDateString('az-AZ')
        };

        await EnhancedNotificationService.createFromTemplate(
          NotificationTemplateService.TEMPLATES.DEADLINE_EXPIRED,
          templateData,
          recipients.map(r => r.id)
        );

        // Send email notifications
        await this.sendEmailNotifications(
          recipients,
          NotificationTemplateService.TEMPLATES.DEADLINE_EXPIRED,
          templateData
        );
      }

      // Auto-approve pending data entries for this category
      await this.autoApprovePendingEntries(category.id);

      console.log(`Handled expired deadline for category: ${category.name}`);
    } catch (error) {
      result.errors.push(`Error handling expired deadline: ${error}`);
    }
  }

  /**
   * Get users who should receive notifications for a category
   */
  private static async getNotificationRecipients(category: Category): Promise<User[]> {
    try {
      const recipients: User[] = [];

      if (category.assignment === 'all') {
        // Get all school admins
        const { data: schoolAdmins } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            profiles:user_id (
              id,
              full_name,
              email
            )
          `)
          .eq('role', 'schooladmin');

        if (schoolAdmins) {
          recipients.push(...schoolAdmins
            .filter(admin => admin.profiles)
            .map(admin => ({
              id: admin.profiles.id,
              full_name: admin.profiles.full_name,
              email: admin.profiles.email
            }))
          );
        }
      } else if (category.assignment === 'sectors') {
        // Get sector and region admins
        const { data: adminUsers } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role,
            profiles:user_id (
              id,
              full_name,
              email
            )
          `)
          .in('role', ['sectoradmin', 'regionadmin']);

        if (adminUsers) {
          recipients.push(...adminUsers
            .filter(admin => admin.profiles)
            .map(admin => ({
              id: admin.profiles.id,
              full_name: admin.profiles.full_name,
              email: admin.profiles.email
            }))
          );
        }
      }

      // Remove duplicates
      const uniqueRecipients = recipients.filter((recipient, index, self) =>
        index === self.findIndex(r => r.id === recipient.id)
      );

      return uniqueRecipients;
    } catch (error) {
      console.error('Error getting notification recipients:', error);
      return [];
    }
  }

  /**
   * Schedule notifications for multiple users
   */
  private static async scheduleNotificationForUsers(
    users: User[],
    templateName: string,
    scheduledFor: Date,
    templateData: any
  ): Promise<void> {
    try {
      for (const user of users) {
        await EnhancedNotificationService.scheduleNotification({
          userId: user.id,
          title: '', // Will be filled by template
          message: '', // Will be filled by template
          scheduledFor,
          templateId: templateName,
          templateData: {
            ...templateData,
            full_name: user.full_name,
            email: user.email
          }
        });
      }
    } catch (error) {
      console.error('Error scheduling notifications for users:', error);
      throw error;
    }
  }

  /**
   * Send email notifications
   */
  private static async sendEmailNotifications(
    recipients: User[],
    templateName: string,
    templateData: any
  ): Promise<void> {
    try {
      // Check user preferences and send emails only to those who have email enabled
      for (const recipient of recipients) {
        const preferences = await EnhancedNotificationService.getUserPreferences(recipient.id);
        
        if (preferences.email_enabled) {
          // Render email template
          const template = await NotificationTemplateService.getTemplateByName(templateName);
          if (template && template.email_template) {
            const rendered = await NotificationTemplateService.renderTemplate(template.id, {
              ...templateData,
              full_name: recipient.full_name,
              email: recipient.email
            });

            if (rendered.emailHtml) {
              await EnhancedNotificationService.sendEmailNotification({
                userIds: [recipient.id],
                subject: rendered.title,
                htmlContent: rendered.emailHtml,
                textContent: rendered.message,
                templateId: template.id,
                templateData
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  }

  /**
   * Auto-approve pending data entries when deadline expires
   */
  private static async autoApprovePendingEntries(categoryId: string): Promise<void> {
    try {
      // Get all pending data entries for this category
      const { data: pendingEntries, error } = await supabase
        .from('data_entries')
        .select('id, school_id')
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending entries:', error);
        return;
      }

      if (!pendingEntries || pendingEntries.length === 0) {
        return;
      }

      // Use the auto-approve edge function
      const { error: functionError } = await supabase.functions.invoke('auto-approve-deadline', {
        body: {
          categoryId,
          entryIds: pendingEntries.map(entry => entry.id)
        }
      });

      if (functionError) {
        console.error('Error auto-approving entries:', functionError);
        return;
      }

      console.log(`Auto-approved ${pendingEntries.length} pending entries for category ${categoryId}`);
    } catch (error) {
      console.error('Error in autoApprovePendingEntries:', error);
    }
  }

  /**
   * Run the complete deadline check job
   */
  static async runDeadlineCheckJob(): Promise<JobResult> {
    try {
      console.log('Starting deadline check job...');
      
      const result = await this.checkUpcomingDeadlines();
      
      const message = `Deadline check completed. Processed: ${result.processed}, ` +
        `3-day warnings: ${result.warnings3Days}, ` +
        `1-day warnings: ${result.warnings1Day}, ` +
        `Expired: ${result.expired}, ` +
        `Errors: ${result.errors.length}`;

      if (result.errors.length > 0) {
        console.error('Deadline check errors:', result.errors);
      }

      console.log(message);

      return {
        success: result.errors.length === 0,
        message,
        data: result
      };
    } catch (error) {
      const errorMessage = `Deadline check job failed: ${error}`;
      console.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Get deadline statistics
   */
  static async getDeadlineStatistics(): Promise<any> {
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .not('deadline', 'is', null)
        .eq('status', 'active');

      if (!categories) return null;

      const now = new Date();
      const stats = {
        totalCategories: categories.length,
        upcoming3Days: 0,
        upcoming1Day: 0,
        expired: 0,
        noDeadline: 0
      };

      categories.forEach(category => {
        if (!category.deadline) {
          stats.noDeadline++;
          return;
        }

        const deadline = new Date(category.deadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff <= 0) {
          stats.expired++;
        } else if (daysDiff <= 1) {
          stats.upcoming1Day++;
        } else if (daysDiff <= 3) {
          stats.upcoming3Days++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting deadline statistics:', error);
      return null;
    }
  }
}

export default DeadlineSchedulerService;
