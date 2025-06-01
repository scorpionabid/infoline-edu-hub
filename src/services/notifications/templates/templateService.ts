import { supabase } from '@/integrations/supabase/client';
import { NotificationType, NotificationPriority } from '@/types/notification';

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  email_template?: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomTemplate {
  name: string;
  title_template: string;
  message_template: string;
  email_template?: string;
  type: NotificationType;
  priority?: NotificationPriority;
}

export interface RenderedTemplate {
  title: string;
  message: string;
  emailHtml?: string;
}

export interface TemplateData {
  [key: string]: any;
}

/**
 * Notification Template Service
 * Manages predefined and custom notification templates
 */
export class NotificationTemplateService {
  
  // Predefined template constants
  static readonly TEMPLATES = {
    DEADLINE_WARNING_3_DAYS: 'deadline_warning_3_days',
    DEADLINE_WARNING_1_DAY: 'deadline_warning_1_day',
    DEADLINE_EXPIRED: 'deadline_expired',
    DATA_APPROVED: 'data_approved',
    DATA_REJECTED: 'data_rejected',
    NEW_CATEGORY: 'new_category',
    NEW_COLUMN: 'new_column',
    MISSING_DATA_REMINDER: 'missing_data_reminder',
    SYSTEM_UPDATE: 'system_update',
    USER_ASSIGNED: 'user_assigned',
    REGION_CREATED: 'region_created',
    SECTOR_CREATED: 'sector_created',
    SCHOOL_CREATED: 'school_created',
    BULK_IMPORT_COMPLETED: 'bulk_import_completed',
    BULK_IMPORT_FAILED: 'bulk_import_failed'
  } as const;

  // Default template definitions
  private static readonly DEFAULT_TEMPLATES: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      name: 'deadline_warning_3_days',
      title_template: '{{category_name}} - 3 gün qalıb',
      message_template: '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti 3 gün sonra bitəcək. Son tarix: {{deadline_date}}',
      email_template: 'deadline_warning_3_days',
      type: 'warning',
      priority: 'high',
      is_active: true
    },
    {
      name: 'deadline_warning_1_day',
      title_template: '{{category_name}} - 1 gün qalıb',
      message_template: '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti sabah bitəcək. Son tarix: {{deadline_date}}',
      email_template: 'deadline_warning_1_day',
      type: 'warning',
      priority: 'critical',
      is_active: true
    },
    {
      name: 'deadline_expired',
      title_template: '{{category_name}} - müddət bitib',
      message_template: '"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib. Məlumatlar avtomatik təsdiqlənəcək.',
      email_template: 'deadline_expired',
      type: 'error',
      priority: 'critical',
      is_active: true
    },
    {
      name: 'data_approved',
      title_template: '{{category_name}} məlumatları təsdiqləndi',
      message_template: '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi. Təsdiqləyən: {{approved_by}}',
      email_template: 'data_approved',
      type: 'success',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'data_rejected',
      title_template: '{{category_name}} məlumatları rədd edildi',
      message_template: '"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi. Səbəb: {{rejection_reason}}',
      email_template: 'data_rejected',
      type: 'error',
      priority: 'high',
      is_active: true
    },
    {
      name: 'new_category',
      title_template: 'Yeni kateqoriya əlavə edildi',
      message_template: '"{{category_name}}" adlı yeni kateqoriya əlavə edildi. Son tarix: {{deadline_date}}',
      email_template: 'new_category',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'new_column',
      title_template: '{{category_name}} kateqoriyasına yeni sütun əlavə edildi',
      message_template: '"{{category_name}}" kateqoriyasına "{{column_name}}" sütunu əlavə edildi.',
      email_template: 'new_column',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'missing_data_reminder',
      title_template: 'Məlumat daxil etmə xatırlatması',
      message_template: '"{{category_name}}" kateqoriyası üçün hələ məlumat daxil etməmisiniz. Son tarix: {{deadline_date}}',
      email_template: 'missing_data_reminder',
      type: 'warning',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'system_update',
      title_template: 'Sistem yeniliyi',
      message_template: 'İnfoLine sistemində yeniliklər edildi: {{update_description}}',
      email_template: 'system_update',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'user_assigned',
      title_template: 'Yeni rol təyin edildi',
      message_template: 'Sizə {{role_name}} rolu təyin edildi. {{assigned_entity}} üçün məsuliyyət daşıyırsınız.',
      email_template: 'user_assigned',
      type: 'info',
      priority: 'high',
      is_active: true
    },
    {
      name: 'region_created',
      title_template: 'Yeni region yaradıldı',
      message_template: '"{{region_name}}" regionu yaradıldı. Admin: {{admin_name}}',
      email_template: 'region_created',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'sector_created',
      title_template: 'Yeni sektor yaradıldı',
      message_template: '"{{sector_name}}" sektoru "{{region_name}}" regionunda yaradıldı.',
      email_template: 'sector_created',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'school_created',
      title_template: 'Yeni məktəb əlavə edildi',
      message_template: '"{{school_name}}" məktəbi "{{sector_name}}" sektoruna əlavə edildi.',
      email_template: 'school_created',
      type: 'info',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'bulk_import_completed',
      title_template: 'Toplu idxal tamamlandı',
      message_template: '{{import_type}} toplu idxalı uğurla tamamlandı. {{success_count}} məlumat əlavə edildi.',
      email_template: 'bulk_import_completed',
      type: 'success',
      priority: 'normal',
      is_active: true
    },
    {
      name: 'bulk_import_failed',
      title_template: 'Toplu idxal uğursuz oldu',
      message_template: '{{import_type}} toplu idxalı uğursuz oldu. Səbəb: {{error_message}}',
      email_template: 'bulk_import_failed',
      type: 'error',
      priority: 'high',
      is_active: true
    }
  ];

  /**
   * Get all active templates
   */
  static async getAllTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get template by name
   */
  static async getTemplateByName(name: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching template by name:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching template by ID:', error);
      throw error;
    }
  }

  /**
   * Render template with provided data
   */
  static async renderTemplate(templateId: string, data: TemplateData): Promise<RenderedTemplate> {
    try {
      const template = await this.getTemplateById(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const renderedTitle = this.processTemplate(template.title_template, data);
      const renderedMessage = this.processTemplate(template.message_template, data);
      
      let renderedEmailHtml: string | undefined;
      if (template.email_template) {
        // Get email template HTML
        const emailHtml = await this.getEmailTemplate(template.email_template);
        if (emailHtml) {
          renderedEmailHtml = this.processTemplate(emailHtml, data);
        }
      }

      return {
        title: renderedTitle,
        message: renderedMessage,
        emailHtml: renderedEmailHtml
      };
    } catch (error) {
      console.error('Error rendering template:', error);
      throw error;
    }
  }

  /**
   * Create custom template
   */
  static async createCustomTemplate(template: CustomTemplate): Promise<string> {
    try {
      const templateData = {
        name: template.name,
        title_template: template.title_template,
        message_template: template.message_template,
        email_template: template.email_template,
        type: template.type,
        priority: template.priority || 'normal',
        is_active: true
      };

      const { data, error } = await supabase
        .from('notification_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating custom template:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  static async updateTemplate(id: string, updates: Partial<CustomTemplate>): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Deactivate template (soft delete)
   */
  static async deactivateTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deactivating template:', error);
      throw error;
    }
  }

  /**
   * Initialize default templates in database
   */
  static async initializeDefaultTemplates(): Promise<void> {
    try {
      // Check if templates already exist
      const { data: existingTemplates } = await supabase
        .from('notification_templates')
        .select('name');

      const existingNames = new Set(existingTemplates?.map(t => t.name) || []);
      
      // Filter out templates that already exist
      const templatesToCreate = this.DEFAULT_TEMPLATES.filter(
        template => !existingNames.has(template.name)
      );

      if (templatesToCreate.length === 0) {
        console.log('All default templates already exist');
        return;
      }

      // Insert new templates
      const { error } = await supabase
        .from('notification_templates')
        .insert(templatesToCreate);

      if (error) {
        throw error;
      }

      console.log(`Initialized ${templatesToCreate.length} default templates`);
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    }
  }

  /**
   * Get email template HTML content
   */
  private static async getEmailTemplate(templateName: string): Promise<string | null> {
    try {
      // This could be expanded to fetch from storage or database
      // For now, we'll use predefined email templates
      const emailTemplates: Record<string, string> = {
        deadline_warning_3_days: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #f59e0b;">Son Tarix Xəbərdarlığı - 3 Gün</h2>
            <p>Hörmətli {{full_name}},</p>
            <p>"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti <strong>3 gün</strong> sonra bitəcək.</p>
            <p><strong>Son tarix:</strong> {{deadline_date}}</p>
            <div style="margin: 20px 0;">
              <a href="{{data_entry_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Məlumatları Daxil Et
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.</p>
          </div>
        `,
        deadline_warning_1_day: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #ef4444;">Son Tarix Xəbərdarlığı - 1 Gün</h2>
            <p>Hörmətli {{full_name}},</p>
            <p>"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti <strong>sabah</strong> bitəcək!</p>
            <p><strong>Son tarix:</strong> {{deadline_date}}</p>
            <div style="margin: 20px 0;">
              <a href="{{data_entry_url}}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Təcili: Məlumatları Daxil Et
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.</p>
          </div>
        `,
        deadline_expired: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #dc2626;">Son Tarix Keçib</h2>
            <p>Hörmətli {{full_name}},</p>
            <p>"{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib.</p>
            <p>Mövcud məlumatlar avtomatik təsdiqlənəcək.</p>
            <p><strong>Son tarix idi:</strong> {{deadline_date}}</p>
            <p style="color: #6b7280; font-size: 14px;">Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.</p>
          </div>
        `,
        data_approved: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #10b981;">Məlumatlar Təsdiqləndi</h2>
            <p>Hörmətli {{full_name}},</p>
            <p>"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar təsdiqləndi.</p>
            <p><strong>Təsdiqləyən:</strong> {{approved_by}}</p>
            <p><strong>Təsdiq tarixi:</strong> {{approved_date}}</p>
            <p style="color: #6b7280; font-size: 14px;">Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.</p>
          </div>
        `,
        data_rejected: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #ef4444;">Məlumatlar Rədd Edildi</h2>
            <p>Hörmətli {{full_name}},</p>
            <p>"{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi.</p>
            <p><strong>Səbəb:</strong> {{rejection_reason}}</p>
            <div style="margin: 20px 0;">
              <a href="{{data_entry_url}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Məlumatları Yenidən Daxil Et
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.</p>
          </div>
        `
      };

      return emailTemplates[templateName] || null;
    } catch (error) {
      console.error('Error getting email template:', error);
      return null;
    }
  }

  /**
   * Process template with data substitution
   */
  private static processTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Validate template syntax
   */
  static validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for unclosed template tags
    const openTags = (template.match(/\{\{/g) || []).length;
    const closeTags = (template.match(/\}\}/g) || []).length;
    
    if (openTags !== closeTags) {
      errors.push('Template has unclosed tags');
    }
    
    // Check for invalid template syntax
    const invalidTags = template.match(/\{\{[^}]*\{\{|\}\}[^{]*\}\}/g);
    if (invalidTags) {
      errors.push('Template has invalid tag syntax');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get template variables from template string
   */
  static extractTemplateVariables(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/\{\{|\}\}/g, '')))];
  }
}

export default NotificationTemplateService;
