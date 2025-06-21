# Step 2: Email Template System (Continued)

### 3. Email Template Management UI (Continued)

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Send } from 'lucide-react';
import { toast } from 'sonner';
import EmailTemplateService from '@/services/emailTemplateService';
import type { NotificationTemplate } from '@/notifications/core/types';

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'info',
    title_template: '',
    message_template: '',
    email_template: '',
    variables: [] as string[],
    default_priority: 'normal',
    default_channels: ['inApp', 'email']
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await EmailTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Template-lər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditMode(true);
    setFormData({
      name: '',
      description: '',
      type: 'info',
      title_template: '',
      message_template: '',
      email_template: '',
      variables: [],
      default_priority: 'normal',
      default_channels: ['inApp', 'email']
    });
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsEditMode(true);
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      title_template: template.title_template,
      message_template: template.message_template,
      email_template: template.email_template || '',
      variables: template.variables || [],
      default_priority: template.default_priority,
      default_channels: template.default_channels || ['inApp']
    });
  };

  const handleSaveTemplate = async () => {
    try {
      // Extract variables from templates
      const titleVars = EmailTemplateService.extractTemplateVariables(formData.title_template);
      const messageVars = EmailTemplateService.extractTemplateVariables(formData.message_template);
      const emailVars = formData.email_template ? 
        EmailTemplateService.extractTemplateVariables(formData.email_template) : [];
      
      const allVariables = [...new Set([...titleVars, ...messageVars, ...emailVars])];

      const templateData = {
        ...formData,
        variables: allVariables
      };

      if (selectedTemplate) {
        await EmailTemplateService.updateTemplate({
          id: selectedTemplate.id,
          ...templateData
        });
        toast.success('Template uğurla yeniləndi');
      } else {
        await EmailTemplateService.createTemplate(templateData);
        toast.success('Template uğurla yaradıldı');
      }

      setIsEditMode(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Template saxlanılarkən xəta baş verdi');
    }
  };

  const handleDeleteTemplate = async (template: NotificationTemplate) => {
    if (!confirm(`"${template.name}" template-ini silmək istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      await EmailTemplateService.deleteTemplate(template.id);
      toast.success('Template uğurla silindi');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Template silinərkən xəta baş verdi');
    }
  };

  const handlePreviewTemplate = async (template: NotificationTemplate) => {
    try {
      const sampleData = {
        full_name: 'Test İstifadəçi',
        category_name: 'Test Kateqoriyası',
        deadline_date: '2024-12-31',
        days_remaining: 3,
        school_name: 'Test Məktəbi',
        data_entry_url: 'https://infoline.edu.az/data-entry/123'
      };

      const preview = await EmailTemplateService.previewTemplate(template.name, sampleData);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing template:', error);
      toast.error('Template önbaxışında xəta baş verdi');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      deadline: 'bg-orange-100 text-orange-800',
      approval: 'bg-green-100 text-green-800',
      rejection: 'bg-red-100 text-red-800',
      system: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Template İdarəetməsi</h2>
          <p className="text-muted-foreground">
            Bildiriş email-ləri üçün template-ləri idarə edin
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Siyahısı</CardTitle>
          <CardDescription>
            Bütün email template-lərinin siyahısı və onların statusları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Prioritet</TableHead>
                <TableHead>Kanallar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(template.type)}</TableCell>
                  <TableCell>{getPriorityBadge(template.default_priority)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {template.default_channels?.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!template.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Template Edit Dialog */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Template Redaktə Et' : 'Yeni Template Yarat'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Template Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Template adı daxil edin"
                />
              </div>
              <div>
                <Label htmlFor="type">Tip</Label>
                <select
                  id="type"
                  className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="deadline">Deadline</option>
                  <option value="approval">Approval</option>
                  <option value="rejection">Rejection</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Təsvir</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Template təsviri"
              />
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList>
                <TabsTrigger value="content">Məzmun</TabsTrigger>
                <TabsTrigger value="email">Email HTML</TabsTrigger>
                <TabsTrigger value="settings">Ayarlar</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="title_template">Başlıq Template</Label>
                  <Input
                    id="title_template"
                    value={formData.title_template}
                    onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
                    placeholder="Məs: {{category_name}} son tarix xatırlatması"
                  />
                </div>

                <div>
                  <Label htmlFor="message_template">Mesaj Template</Label>
                  <Textarea
                    id="message_template"
                    value={formData.message_template}
                    onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                    placeholder="Məs: {{category_name}} üçün son tarix {{deadline_date}} tarixindədir."
                    rows={4}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">İstifadə edilə bilən dəyişənlər:</h4>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <code className="bg-background px-2 py-1 rounded">{{`full_name`}}</code>
                    <code className="bg-background px-2 py-1 rounded">{{`category_name`}}</code>
                    <code className="bg-background px-2 py-1 rounded">{{`deadline_date`}}</code>
                    <code className="bg-background px-2 py-1 rounded">{{`school_name`}}</code>
                    <code className="bg-background px-2 py-1 rounded">{{`days_remaining`}}</code>
                    <code className="bg-background px-2 py-1 rounded">{{`data_entry_url`}}</code>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label htmlFor="email_template">Email HTML Template</Label>
                  <Textarea
                    id="email_template"
                    value={formData.email_template}
                    onChange={(e) => setFormData({ ...formData, email_template: e.target.value })}
                    placeholder="HTML email template (boş buraxılsa default template istifadə olunacaq)"
                    rows={10}
                    className="font-mono"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">HTML template məlumatları:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• {{`subject`}} - email başlığı</li>
                    <li>• {{`message`}} - əsas mesaj</li>
                    <li>• Bütün digər dəyişənlər də istifadə edilə bilər</li>
                    <li>• Boş buraxılsa default HTML template istifadə olunacaq</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Default Prioritet</Label>
                    <select
                      id="priority"
                      className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
                      value={formData.default_priority}
                      onChange={(e) => setFormData({ ...formData, default_priority: e.target.value })}
                    >
                      <option value="low">Aşağı</option>
                      <option value="normal">Normal</option>
                      <option value="high">Yüksək</option>
                      <option value="critical">Kritik</option>
                    </select>
                  </div>

                  <div>
                    <Label>Default Kanallar</Label>
                    <div className="flex gap-4 mt-2">
                      {['inApp', 'email', 'push', 'sms'].map((channel) => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.default_channels.includes(channel)}
                            onChange={(e) => {
                              const channels = e.target.checked
                                ? [...formData.default_channels, channel]
                                : formData.default_channels.filter(c => c !== channel);
                              setFormData({ ...formData, default_channels: channels });
                            }}
                          />
                          <span className="text-sm">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                İmtina
              </Button>
              <Button onClick={handleSaveTemplate}>
                Saxla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Önbaxışı</DialogTitle>
          </DialogHeader>
          
          {previewData && (
            <Tabs defaultValue="email" className="w-full">
              <TabsList>
                <TabsTrigger value="email">Email Görünüşü</TabsTrigger>
                <TabsTrigger value="text">Mətn Görünüşü</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <div className="border rounded-lg p-4">
                  <div className="mb-4">
                    <strong>Başlıq:</strong> {previewData.subject}
                  </div>
                  <div 
                    className="border border-gray-200 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: previewData.html }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="text">
                <div className="border rounded-lg p-4">
                  <div className="mb-4">
                    <strong>Başlıq:</strong> {previewData.subject}
                  </div>
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded">
                    {previewData.text}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;
```

### 4. Notification Manager Integration

**Fayl:** `src/notifications/core/NotificationManager.ts` (yeniləmə)

```typescript
// Add to existing NotificationManager.ts

/**
 * Send email notification using template
 */
async sendEmailNotification(
  templateName: string,
  templateData: Record<string, any>,
  recipients: string[],
  priority: NotificationPriority = 'normal'
): Promise<{
  sent: number;
  failed: number;
  errors: string[];
}> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.functions.invoke('send-template-email', {
      body: {
        templateName,
        templateData,
        recipients,
        priority
      }
    });

    if (error) throw error;

    this.trackPerformance('sendEmailNotification', startTime, true);
    return data.results;

  } catch (error) {
    console.error('[NotificationManager] Error sending email notification:', error);
    this.trackPerformance('sendEmailNotification', startTime, false);
    
    return {
      sent: 0,
      failed: recipients.length,
      errors: [error.message]
    };
  }
}
```

## ✅ Yoxlama Addımları

1. **Edge Function deployment:**
   ```bash
   supabase functions deploy send-template-email
   ```

2. **Environment variables:**
   ```bash
   # .env.local
   RESEND_API_KEY=your_resend_api_key
   # OR
   SENDGRID_API_KEY=your_sendgrid_api_key
   
   FROM_EMAIL=noreply@infoline.edu.az
   FROM_NAME=İnfoLine Sistema
   ```

3. **Test email template:**
   ```bash
   curl -X POST 'your-supabase-url/functions/v1/send-template-email' \
   -H 'Authorization: Bearer your-anon-key' \
   -H 'Content-Type: application/json' \
   -d '{
     "templateName": "deadline_warning_3_days",
     "templateData": {
       "category_name": "Test Kateqoriyası",
       "deadline_date": "2024-12-31",
       "days_remaining": 3
     },
     "recipients": ["user-uuid"]
   }'
   ```

4. **UI komponentini test edin:**
   - Admin panelə EmailTemplateManager əlavə edin
   - Template yaratma/redaktə test edin
   - Preview funksionallığını yoxlayın

## 🔄 Növbəti Addım

Bu step tamamlandıqdan sonra [Step 3: User Notification Preferences](./03-user-preferences.md) addımına keçin.

## 📚 Əlaqəli Fayllar

- `supabase/functions/deadline-checker/index.ts` - deadline yoxlama funksiyası
- `src/notifications/core/NotificationManager.ts` - əsas notification manager
- `src/components/admin/` - admin UI komponentləri

---

**Status:** 📋 Ready for implementation
**Estimated time:** 1 gün
**Dependencies:** Step 1 (Database Enhancements), Email provider API key