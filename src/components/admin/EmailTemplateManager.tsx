import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  FileText,
  BarChart3 
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  title_template: string;
  message_template: string;
  email_template?: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  variables: string[];
  default_priority: string;
  default_channels: string[];
}

interface EmailTemplateStats {
  total: number;
  active: number;
  system: number;
  custom: number;
  lastWeekUsage: number;
}

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [stats, setStats] = useState<EmailTemplateStats>({
    total: 0,
    active: 0,
    system: 0,
    custom: 0,
    lastWeekUsage: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    title_template: '',
    message_template: '',
    email_template: '',
    variables: '',
    default_priority: 'normal',
    default_channels: 'inApp'
  });

  const handleCreate = () => {
    // Template creation logic
    console.log('Creating template:', formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      title_template: template.title_template,
      message_template: template.message_template,
      email_template: template.email_template || '',
      variables: template.variables.join(', '),
      default_priority: template.default_priority,
      default_channels: template.default_channels.join(', ')
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    // Template update logic
    console.log('Updating template:', selectedTemplate?.id, formData);
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = (templateId: string) => {
    // Template deletion logic
    console.log('Deleting template:', templateId);
  };

  const handleStatusToggle = (templateId: string, isActive: boolean) => {
    // Status toggle logic
    console.log('Toggling status:', templateId, isActive);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      title_template: '',
      message_template: '',
      email_template: '',
      variables: '',
      default_priority: 'normal',
      default_channels: 'inApp'
    });
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Email Template Manager</h1>
          <p className="text-muted-foreground">
            Manage notification and email templates
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    placeholder="notification, email, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title Template</Label>
                <Input
                  id="title"
                  value={formData.title_template}
                  onChange={(e) => setFormData({...formData, title_template: e.target.value})}
                  placeholder="Email subject template"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message Template</Label>
                <Textarea
                  id="message"
                  value={formData.message_template}
                  onChange={(e) => setFormData({...formData, message_template: e.target.value})}
                  placeholder="Message content template"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Template</Label>
                <Textarea
                  id="email"
                  value={formData.email_template}
                  onChange={(e) => setFormData({...formData, email_template: e.target.value})}
                  placeholder="HTML email template"
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="variables">Variables (comma-separated)</Label>
                <Input
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData({...formData, variables: e.target.value})}
                  placeholder="user_name, school_name, date"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  // Cancel
                </Button>
                <Button onClick={handleCreate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">System</p>
                <p className="text-2xl font-bold">{stats.system}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Custom</p>
                <p className="text-2xl font-bold">{stats.custom}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates found. Create your first template to get started.
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {template.is_system && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.type}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.title_template}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`status-${template.id}`} className="text-sm">
                        // Active
                      </Label>
                      <Switch
                        id={`status-${template.id}`}
                        checked={template.is_active}
                        onCheckedChange={(checked) => handleStatusToggle(template.id, checked)}
                      />
                    </div>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    <Button
                      variant="ghost"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {!template.is_system && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Input
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="notification, email, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                // Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <p className="font-medium">{selectedTemplate.name}</p>
              </div>
              
              <div>
                <Label>Title</Label>
                <p className="p-2 bg-muted rounded">{selectedTemplate.title_template}</p>
              </div>
              
              <div>
                <Label>Message</Label>
                <div className="p-4 bg-muted rounded min-h-[100px]">
                  {selectedTemplate.message_template}
                </div>
              </div>
              
              {selectedTemplate.email_template && (
                <div>
                  <Label>Email HTML</Label>
                  <div className="p-4 bg-muted rounded max-h-[200px] overflow-auto">
                    <pre className="text-sm">{selectedTemplate.email_template}</pre>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setIsPreviewDialogOpen(false)}>
                  // Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;
