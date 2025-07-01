/**
 * Email Template Service
 * Email template idarəetməsi üçün xidmət sinfi
 */

import { supabase } from '@/integrations/supabase/client';
import type { NotificationTemplate } from '@/notifications/core/types';

export interface EmailTemplateCreateRequest {
  name: string;
  description?: string;
  type: string;
  title_template: string;
  message_template: string;
  email_template?: string;
  variables?: string[];
  default_priority: string;
  default_channels: string[];
}

export interface EmailTemplateUpdateRequest extends EmailTemplateCreateRequest {
  id: string;
}

export interface EmailPreviewResponse {
  subject: string;
  html: string;
  text: string;
}

class EmailTemplateService {
  /**
   * Get all notification templates
   */
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[EmailTemplateService] Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get template by name
   */
  async getTemplateByName(name: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('[EmailTemplateService] Error fetching template by name:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(template: EmailTemplateCreateRequest): Promise<NotificationTemplate> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          name: template.name,
          description: template.description,
          type: template.type,
          title_template: template.title_template,
          message_template: template.message_template,
          email_template: template.email_template,
          variables: template.variables || [],
          default_priority: template.default_priority,
          default_channels: template.default_channels,
          is_active: true,
          is_system: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[EmailTemplateService] Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update existing template
   */
  async updateTemplate(template: EmailTemplateUpdateRequest): Promise<NotificationTemplate> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .update({
          name: template.name,
          description: template.description,
          type: template.type,
          title_template: template.title_template,
          message_template: template.message_template,
          email_template: template.email_template,
          variables: template.variables || [],
          default_priority: template.default_priority,
          default_channels: template.default_channels,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[EmailTemplateService] Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template (only non-system templates)
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId)
        .eq('is_system', false); // Only allow deletion of non-system templates

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[EmailTemplateService] Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Toggle template active status
   */
  async toggleTemplate(templateId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[EmailTemplateService] Error toggling template:', error);
      throw error;
    }
  }

  /**
   * Extract template variables from text
   */
  extractTemplateVariables(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return matches
      .map(match => match.replace(/\{\{|\}\}/g, '').trim())
      .filter((variable, index, self) => self.indexOf(variable) === index); // Remove duplicates
  }

  /**
   * Render template with data
   */
  renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(data[key] || ''));
    });
    
    return rendered;
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(templateName: string, sampleData: Record<string, any>): Promise<EmailPreviewResponse> {
    try {
      const template = await this.getTemplateByName(templateName);
      if (!template) throw new Error(`Template "${templateName}" not found`);

      const subject = this.renderTemplate(template.title_template, sampleData);
      const text = this.renderTemplate(template.message_template, sampleData);
      
      let html = '';
      if (template.email_template) {
        html = this.renderTemplate(template.email_template, {
          ...sampleData,
          subject,
          message: text
        });
      } else {
        // Use default HTML template
        html = this.getDefaultEmailHTML(subject, text);
      }

      return {
        subject,
        html,
        // text
      };
    } catch (error) {
      console.error('[EmailTemplateService] Error previewing template:', error);
      throw error;
    }
  }

  /**
   * Get default HTML email template
   */
  private getDefaultEmailHTML(subject: string, message: string): string {
    return `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-body {
            padding: 30px 20px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        .message-content {
            margin: 20px 0;
            line-height: 1.8;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>📚 İnfoLine</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Təhsil Məlumat Sistemi</p>
        </div>
        
        <div class="email-body">
            <div class="message-content">
                ${message.replace(/\n/g, '<br>')}
            </div>
            
            <p>
                <a href="https://infoline.edu.az" class="cta-button">
                    Sistemə daxil ol
                </a>
            </p>
        </div>
        
        <div class="email-footer">
            <p>
                Bu email avtomatik olaraq göndərilmişdir.<br>
                Suallarda support@infoline.edu.az ünvanına müraciət edin.
            </p>
            <p style="margin-top: 15px;">
                <small>© 2024 İnfoLine Təhsil Sistemi. Bütün hüquqlar qorunur.</small>
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Send test email using template
   */
  async sendTestEmail(templateName: string, recipientEmail: string, testData: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateName,
          templateData: testData,
          recipients: [recipientEmail],
          isTest: true
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[EmailTemplateService] Error sending test email:', error);
      throw error;
    }
  }

  /**
   * Get template usage statistics
   */
  async getTemplateStats(templateId?: string): Promise<{
    totalSent: number;
    delivered: number;
    failed: number;
    lastUsed: string | null;
  }> {
    try {
      let query = supabase
        .from('notification_delivery_log')
        .select('status, created_at');

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        totalSent: data?.length || 0,
        delivered: data?.filter(d => d.status === 'delivered').length || 0,
        failed: data?.filter(d => d.status === 'failed').length || 0,
        lastUsed: data?.length > 0 ? data[0].created_at : null
      };

      return stats;
    } catch (error) {
      console.error('[EmailTemplateService] Error fetching template stats:', error);
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        lastUsed: null
      };
    }
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: string): {
    isValid: boolean;
    errors: string[];
    variables: string[];
  } {
    const errors: string[] = [];
    const variables = this.extractTemplateVariables(template);

    // Check for unclosed template tags
    const openTags = (template.match(/\{\{/g) || []).length;
    const closeTags = (template.match(/\}\}/g) || []).length;
    
    if (openTags !== closeTags) {
      errors.push('Template-də bağlanmamış tag-lər var');
    }

    // Check for nested tags (not supported)
    if (template.match(/\{\{[^}]*\{\{/)) {
      errors.push('İç-içə template tag-ləri dəstəklənmir');
    }

    // Check for empty variables
    if (template.match(/\{\{\s*\}\}/)) {
      errors.push('Boş template dəyişənləri mövcuddur');
    }

    return {
      isValid: errors.length === 0,
      errors,
      variables: variables // Include the extracted variables in the return statement
    };
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(templateId: string, newName: string): Promise<NotificationTemplate> {
    try {
      // Get original template
      const { data: original, error: fetchError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const duplicate = {
        name: newName,
        description: `${original.description || ''} (copy)`,
        type: original.type,
        title_template: original.title_template,
        message_template: original.message_template,
        email_template: original.email_template,
        variables: original.variables,
        default_priority: original.default_priority,
        default_channels: original.default_channels,
        is_active: false, // Start as inactive
        is_system: false // Never copy as system template
      };

      const { data, error } = await supabase
        .from('notification_templates')
        .insert(duplicate)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[EmailTemplateService] Error duplicating template:', error);
      throw error;
    }
  }

  /**
   * Export template configuration
   */
  async exportTemplate(templateId: string): Promise<string> {
    try {
      const { data: template, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Remove ID and timestamps for export
      const exportData = {
        name: template.name,
        description: template.description,
        type: template.type,
        title_template: template.title_template,
        message_template: template.message_template,
        email_template: template.email_template,
        variables: template.variables,
        default_priority: template.default_priority,
        default_channels: template.default_channels
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('[EmailTemplateService] Error exporting template:', error);
      throw error;
    }
  }

  /**
   * Import template configuration
   */
  async importTemplate(templateJson: string): Promise<NotificationTemplate> {
    try {
      const templateData = JSON.parse(templateJson);
      
      // Validate required fields
      const requiredFields = ['name', 'type', 'title_template', 'message_template'];
      for (const field of requiredFields) {
        if (!templateData[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      return await this.createTemplate(templateData);
    } catch (error) {
      console.error('[EmailTemplateService] Error importing template:', error);
      throw error;
    }
  }
}

const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
