
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Eye, Mail, Settings, BarChart3 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'notification' | 'welcome' | 'reminder' | 'approval';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  lastUsed: string | null;
}

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Xoş gəldin mesajı',
      subject: 'İnfoLine-a xoş gəldiniz',
      body: 'Hörmətli {{name}}, sistemə xoş gəldiniz...',
      type: 'welcome',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Təsdiq bildirişi',
      subject: 'Məlumatlarınız təsdiqləndi',
      body: 'Təbrik edirik! {{category}} kateqoriyası üzrə məlumatlarınız təsdiqləndi.',
      type: 'approval',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    body: '',
    type: 'notification',
    is_active: true
  });

  const templateStats: TemplateStats = {
    totalSent: 1247,
    delivered: 1223,
    opened: 856,
    clicked: 234,
    lastUsed: '2024-01-15'
  };

  const handleCreateTemplate = () => {
    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name || '',
      subject: newTemplate.subject || '',
      body: newTemplate.body || '',
      type: newTemplate.type as EmailTemplate['type'] || 'notification',
      is_active: newTemplate.is_active || true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      type: 'notification',
      is_active: true
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditTemplate = () => {
    if (!selectedTemplate) return;

    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id 
        ? { ...selectedTemplate, updated_at: new Date().toISOString() }
        : t
    ));
    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Bu template-i silmək istədiyinizə əminsiniz?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const toggleTemplateStatus = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, is_active: !t.is_active } : t
    ));
  };

  const getTypeColor = (type: EmailTemplate['type']) => {
    switch (type) {
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'approval': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: EmailTemplate['type']) => {
    switch (type) {
      case 'welcome': return 'Xoş gəldin';
      case 'notification': return 'Bildiriş';
      case 'reminder': return 'Xatırlatma';
      case 'approval': return 'Təsdiq';
      default: return 'Digər';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Template-lər</h2>
          <p className="text-muted-foreground">
            Sistem bildirişləri üçün email template-lərini idarə edin
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Template Yarat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Email Template</DialogTitle>
              <DialogDescription>
                Yeni email template yaradın və konfiqurasiya edin
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Adı</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Template adını daxil edin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Template Tipi</Label>
                  <Select 
                    value={newTemplate.type} 
                    onValueChange={(value) => setNewTemplate({...newTemplate, type: value as EmailTemplate['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tip seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Bildiriş</SelectItem>
                      <SelectItem value="welcome">Xoş gəldin</SelectItem>
                      <SelectItem value="reminder">Xatırlatma</SelectItem>
                      <SelectItem value="approval">Təsdiq</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Mövzu</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  placeholder="Email mövzusunu daxil edin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Məzmun</Label>
                <Textarea
                  id="body"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                  placeholder="Email məzmununu daxil edin. {{name}}, {{category}} kimi placeholder-lərdən istifadə edə bilərsiniz."
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newTemplate.is_active}
                  onCheckedChange={(checked) => setNewTemplate({...newTemplate, is_active: checked})}
                />
                <Label htmlFor="active">Template aktiv et</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Ləğv et
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Template Yarat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(template.type)}>
                  {getTypeLabel(template.type)}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Mövzu:</p>
                <p className="text-sm text-muted-foreground">{template.subject}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => toggleTemplateStatus(template.id)}
                      size="sm"
                    />
                    <span className="text-sm">
                      {template.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(template.updated_at).toLocaleDateString('az-AZ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Düzənlə</DialogTitle>
            <DialogDescription>
              Email template-ini düzənləyin
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Adı</Label>
                  <Input
                    id="edit-name"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Template Tipi</Label>
                  <Select 
                    value={selectedTemplate.type} 
                    onValueChange={(value) => setSelectedTemplate({...selectedTemplate, type: value as EmailTemplate['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Bildiriş</SelectItem>
                      <SelectItem value="welcome">Xoş gəldin</SelectItem>
                      <SelectItem value="reminder">Xatırlatma</SelectItem>
                      <SelectItem value="approval">Təsdiq</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject">Mövzu</Label>
                <Input
                  id="edit-subject"
                  value={selectedTemplate.subject}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-body">Məzmun</Label>
                <Textarea
                  id="edit-body"
                  value={selectedTemplate.body}
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={selectedTemplate.is_active}
                  onCheckedChange={(checked) => setSelectedTemplate({...selectedTemplate, is_active: checked})}
                />
                <Label htmlFor="edit-active">Template aktiv et</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Ləğv et
                </Button>
                <Button onClick={handleEditTemplate}>
                  Dəyişiklikləri Saxla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Önizləmə</DialogTitle>
            <DialogDescription>
              Email template-inin görünüşü
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-lg p-4">
            <div className="border-b pb-2 mb-4">
              <h3 className="font-semibold">Mövzu: Xoş gəldin mesajı</h3>
            </div>
            <div className="space-y-2">
              <p>Hörmətli İstifadəçi,</p>
              <p>İnfoLine sistemə xoş gəldiniz...</p>
              <p>Hörmətlə,<br />İnfoLine Komandası</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Statistikası</DialogTitle>
            <DialogDescription>
              Email template performans məlumatları
            </DialogDescription>
          </DialogHeader>
          
          {templateStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ümumi Göndərilən</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{templateStats.totalSent}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Çatdırılan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{templateStats.delivered}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Açılan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{templateStats.opened}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Son İstifadə</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {templateStats.lastUsed 
                        ? new Date(templateStats.lastUsed).toLocaleDateString('az-AZ')
                        : 'Heç vaxt'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {templateStats.totalSent > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Çatdırılma faizi:</span>
                    <span className="font-medium">
                      {Math.round((templateStats.delivered / templateStats.totalSent) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.round((templateStats.delivered / templateStats.totalSent) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;
