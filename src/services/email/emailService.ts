import { supabase } from '@/integrations/supabase/client';

export interface EmailParams {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
  disposition?: 'attachment' | 'inline';
}

export interface EmailTemplateData {
  [key: string]: any;
}

export interface BulkEmailParams {
  recipients: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  templateData?: EmailTemplateData;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'queued' | 'failed';
}

export interface BulkEmailResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  messageIds: string[];
  errors: string[];
}

export interface EmailPreferences {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    deadlines: boolean;
    approvals: boolean;
    system: boolean;
    reminders: boolean;
  };
}

/**
 * Email Service for sending notifications via email
 * Integrates with Supabase Edge Functions for email delivery
 */
export class EmailService {
  
  // Default email configuration
  private static readonly DEFAULT_FROM_NAME = 'İnfoLine Sistem';
  private static readonly DEFAULT_REPLY_TO = 'noreply@infoline.edu.az';
  
  /**
   * Send a single email
   */
  static async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      const emailData = {
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent || this.stripHtml(params.htmlContent),
        fromName: params.fromName || this.DEFAULT_FROM_NAME,
        replyTo: params.replyTo || this.DEFAULT_REPLY_TO,
        attachments: params.attachments || []
      };

      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: emailData
      });

      if (error) {
        console.error('Error sending email:', error);
        return { 
          success: false, 
          error: error.message,
          deliveryStatus: 'failed'
        };
      }

      // Log email delivery
      await this.logEmailDelivery(emailData.to, emailData.subject, 'sent', data?.messageId);

      return { 
        success: true, 
        messageId: data?.messageId,
        deliveryStatus: 'sent'
      };
    } catch (error) {
      console.error('Error in sendEmail:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus: 'failed'
      };
    }
  }

  /**
   * Send template-based email
   */
  static async sendTemplateEmail(
    templateId: string, 
    data: EmailTemplateData,
    recipients: string[]
  ): Promise<EmailResult> {
    try {
      const emailData = {
        templateId,
        templateData: data,
        recipients,
        fromName: this.DEFAULT_FROM_NAME,
        replyTo: this.DEFAULT_REPLY_TO
      };

      const { data: result, error } = await supabase.functions.invoke('send-template-email', {
        body: emailData
      });

      if (error) {
        console.error('Error sending template email:', error);
        return { 
          success: false, 
          error: error.message,
          deliveryStatus: 'failed'
        };
      }

      // Log email delivery
      await this.logEmailDelivery(recipients, `Template: ${templateId}`, 'sent', result?.messageId);

      return { 
        success: true, 
        messageId: result?.messageId,
        deliveryStatus: 'sent'
      };
    } catch (error) {
      console.error('Error in sendTemplateEmail:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus: 'failed'
      };
    }
  }

  /**
   * Send bulk emails
   */
  static async sendBulkEmails(emails: BulkEmailParams[]): Promise<BulkEmailResult> {
    const result: BulkEmailResult = {
      success: false,
      successCount: 0,
      failureCount: 0,
      messageIds: [],
      errors: []
    };

    try {
      // Process emails in batches to avoid overwhelming the email service
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (email) => {
          try {
            const emailResult = await this.sendEmail({
              to: email.recipients,
              subject: email.subject,
              htmlContent: email.htmlContent,
              textContent: email.textContent
            });

            if (emailResult.success) {
              result.successCount++;
              if (emailResult.messageId) {
                result.messageIds.push(emailResult.messageId);
              }
            } else {
              result.failureCount++;
              if (emailResult.error) {
                result.errors.push(emailResult.error);
              }
            }

            return emailResult;
          } catch (error) {
            result.failureCount++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(errorMessage);
            return { success: false, error: errorMessage };
          }
        });

        // Wait for current batch to complete before processing next batch
        await Promise.all(batchPromises);
        
        // Small delay between batches to prevent rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      result.success = result.successCount > 0;

      return result;
    } catch (error) {
      console.error('Error in sendBulkEmails:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Get user email preferences
   */
  static async getEmailPreferences(userId: string): Promise<EmailPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return default preferences if none exist
      return {
        enabled: data?.email_enabled ?? true,
        frequency: data?.digest_frequency ?? 'immediate',
        types: {
          deadlines: data?.category_preferences?.deadlines ?? true,
          approvals: data?.category_preferences?.approvals ?? true,
          system: data?.category_preferences?.system ?? true,
          reminders: data?.category_preferences?.reminders ?? true
        }
      };
    } catch (error) {
      console.error('Error getting email preferences:', error);
      // Return default preferences on error
      return {
        enabled: true,
        frequency: 'immediate',
        types: {
          deadlines: true,
          approvals: true,
          system: true,
          reminders: true
        }
      };
    }
  }

  /**
   * Update user email preferences
   */
  static async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<void> {
    try {
      const updateData: any = {};

      if (preferences.enabled !== undefined) {
        updateData.email_enabled = preferences.enabled;
      }

      if (preferences.frequency !== undefined) {
        updateData.digest_frequency = preferences.frequency;
      }

      if (preferences.types !== undefined) {
        updateData.category_preferences = {
          ...updateData.category_preferences,
          ...preferences.types
        };
      }

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  }

  /**
   * Send digest email (daily/weekly summary)
   */
  static async sendDigestEmail(userId: string, period: 'daily' | 'weekly'): Promise<EmailResult> {
    try {
      // Get user's unread notifications for the period
      const startDate = new Date();
      if (period === 'daily') {
        startDate.setDate(startDate.getDate() - 1);
      } else {
        startDate.setDate(startDate.getDate() - 7);
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!notifications || notifications.length === 0) {
        return { success: true, deliveryStatus: 'sent' }; // No notifications to send
      }

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      // Generate digest email content
      const digestHtml = this.generateDigestHtml(notifications, period, user.full_name);
      const subject = `İnfoLine ${period === 'daily' ? 'Günlük' : 'Həftəlik'} Xülasə - ${notifications.length} bildiriş`;

      return await this.sendEmail({
        to: user.email,
        subject,
        htmlContent: digestHtml
      });
    } catch (error) {
      console.error('Error sending digest email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        deliveryStatus: 'failed'
      };
    }
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email delivery statistics
   */
  static async getDeliveryStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = supabase
        .from('notification_delivery_log')
        .select('status, delivery_method, created_at')
        .eq('delivery_method', 'email');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        deliveryRate: 0
      };

      data?.forEach(log => {
        switch (log.status) {
          case 'sent':
            stats.sent++;
            break;
          case 'delivered':
            stats.delivered++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'bounced':
            stats.bounced++;
            break;
        }
      });

      stats.deliveryRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Error getting delivery statistics:', error);
      return null;
    }
  }

  /**
   * Log email delivery to database
   */
  private static async logEmailDelivery(
    recipients: string[],
    subject: string,
    status: 'sent' | 'failed',
    messageId?: string
  ): Promise<void> {
    try {
      // This would typically be handled by a webhook from the email service
      // For now, we'll just log the attempt
      console.log(`Email delivery logged: ${status} to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Error logging email delivery:', error);
    }
  }

  /**
   * Strip HTML tags from content to create plain text version
   */
  private static stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Generate HTML content for digest emails
   */
  private static generateDigestHtml(notifications: any[], period: 'daily' | 'weekly', userName: string): string {
    const periodText = period === 'daily' ? 'günlük' : 'həftəlik';
    
    const groupedNotifications = notifications.reduce((groups, notification) => {
      const type = notification.type || 'info';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(notification);
      return groups;
    }, {} as Record<string, any[]>);

    const typeLabels: Record<string, string> = {
      deadline: 'Son Tarix Xəbərdarlıqları',
      approval: 'Təsdiq Bildirişləri',
      warning: 'Xəbərdarlıqlar',
      success: 'Uğurlu Əməliyyatlar',
      error: 'Xətalar',
      info: 'Məlumatlandırma'
    };

    let sectionsHtml = '';
    Object.entries(groupedNotifications).forEach(([type, typeNotifications]) => {
      const label = typeLabels[type] || type;
      sectionsHtml += `
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background: #f8fafc;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${label} (${typeNotifications.length})</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${typeNotifications.map(notification => `
              <li style="margin: 5px 0;">
                <strong>${notification.title}</strong>
                ${notification.message ? `<br><span style="color: #6b7280; font-size: 14px;">${notification.message}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>İnfoLine ${periodText.charAt(0).toUpperCase() + periodText.slice(1)} Xülasə</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">İnfoLine</h1>
          <h2 style="color: #6b7280; margin: 10px 0;">${periodText.charAt(0).toUpperCase() + periodText.slice(1)} Bildiriş Xülasəsi</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Hörmətli ${userName},</p>
          <p>Son ${period === 'daily' ? '24 saat' : '7 gün'} ərzində ${notifications.length} bildiriş aldınız:</p>
        </div>
        
        ${sectionsHtml}
        
        <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 6px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Bu xülasə İnfoLine sistemi tərəfindən avtomatik yaradılıb.
            <br>
            Bildiriş parametrlərini dəyişmək üçün sistem tənzimlərinə daxil olun.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;
