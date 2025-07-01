
import { supabase } from '@/integrations/supabase/client';
import type { NotificationType, NotificationPriority } from '@/types/notification';

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title_template: string;
  message_template: string;
  email_template?: string;
  sms_template?: string;
  variables: string[];
  default_priority: NotificationPriority;
  default_channels: string[];
  is_active: boolean;
  translations?: Record<string, any>;
}

interface TemplateData {
  [key: string]: any;
}

export class NotificationTemplateService {
  static async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return null;
      }

      return data as NotificationTemplate;
    } catch (error) {
      console.error('Error in getTemplate:', error);
      return null;
    }
  }

  static async getTemplatesByType(type: NotificationType): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching templates by type:', error);
        return [];
      }

      return data as NotificationTemplate[];
    } catch (error) {
      console.error('Error in getTemplatesByType:', error);
      return [];
    }
  }

  static renderTemplate(template: NotificationTemplate, data: TemplateData, language = 'az'): {
    title: string;
    message: string;
    emailContent?: string;
    smsContent?: string;
  } {
    try {
      // Get language-specific templates if available
      const translations = template.translations?.[language];
      const titleTemplate = translations?.title_template || template.title_template;
      const messageTemplate = translations?.message_template || template.message_template;
      const emailTemplate = translations?.email_template || template.email_template;
      const smsTemplate = translations?.sms_template || template.sms_template;

      // Simple template variable replacement
      const title = this.replaceVariables(titleTemplate, data);
      const message = this.replaceVariables(messageTemplate, data);
      const emailContent = emailTemplate ? this.replaceVariables(emailTemplate, data) : undefined;
      const smsContent = smsTemplate ? this.replaceVariables(smsTemplate, data) : undefined;

      return {
        title,
        message,
        emailContent,
        smsContent
      };
    } catch (error) {
      console.error('Error rendering template:', error);
      return {
        title: template.title_template,
        message: template.message_template
      };
    }
  }

  private static replaceVariables(template: string, data: TemplateData): string {
    let result = template;
    
    // Replace variables in format {{variableName}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    });

    return result;
  }

  static async createTemplate(templateData: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          ...templateData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        return null;
      }

      return data as NotificationTemplate;
    } catch (error) {
      console.error('Error in createTemplate:', error);
      return null;
    }
  }

  static async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        console.error('Error updating template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      return false;
    }
  }

  static async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      return false;
    }
  }
}

export default NotificationTemplateService;
