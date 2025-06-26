import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExternalLink, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { linkService } from '@/services/linkService';
import { SchoolLink, CreateSchoolLinkData } from '@/types/link';

interface SchoolLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
}

interface LinkFormData {
  title: string;
  url: string;
  description: string;
  category: string;
}

const LINK_CATEGORIES = [
  { value: 'general', label: 'Ümumi' },
  { value: 'education', label: 'Təhsil' },
  { value: 'forms', label: 'Formlar' },
  { value: 'reports', label: 'Hesabatlar' },
  { value: 'resources', label: 'Resurslar' },
];

export const SchoolLinksDialog: React.FC<SchoolLinksDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
}) => {
  // State
  const [links, setLinks] = useState<SchoolLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<SchoolLink | null>(null);
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    category: 'general',
  });

  // Load links when dialog opens
  useEffect(() => {
    if (open && schoolId) {
      loadLinks();
    }
  }, [open, schoolId]);

  // Reset form when editing link changes
  useEffect(() => {
    if (editingLink) {
      setFormData({
        title: editingLink.title,
        url: editingLink.url,
        description: editingLink.description || '',
        category: editingLink.category || 'general',
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'general',
      });
    }
  }, [editingLink]);

  const loadLinks = async () => {
    try {
      setIsLoading(true);
      const data = await linkService.getSchoolLinks(schoolId);
      setLinks(data);
    } catch (error) {
      console.error('Error loading links:', error);
      toast.error('Linklər yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Başlıq və URL tələb olunur');
      return;
    }

    // URL validasiyası
    try {
      new URL(formData.url);
    } catch {
      toast.error('Düzgün URL daxil edin');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingLink) {
        // Update existing link
        await linkService.updateLink(editingLink.id, {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
        });
        toast.success('Link yeniləndi');
      } else {
        // Create new link
        const linkData: CreateSchoolLinkData = {
          school_id: schoolId,
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category,
          is_active: true,
        };
        await linkService.createLink(linkData);
        toast.success('Link əlavə edildi');
      }

      // Reset form and reload links
      setEditingLink(null);
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'general',
      });
      await loadLinks();
    } catch (error: any) {
      console.error('Error saving link:', error);
      if (error.message?.includes('42P01') || error.message?.includes('relation') || error.message?.includes('school_links')) {
        toast.error('Verilənlər bazası xətası: school_links cədvəli tapılmadı. Zəhmət olmasa migration-ı tətbiq edin.');
      } else {
        toast.error('Link saxlanılarkən xəta baş verdi: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (link: SchoolLink) => {
    setEditingLink(link);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
  };

  const handleDelete = async (link: SchoolLink) => {
    if (!confirm('Bu linki silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await linkService.deleteLink(link.id);
      toast.success('Link silindi');
      await loadLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Link silinərkən xəta baş verdi');
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = LINK_CATEGORIES.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Məktəb Linkləri</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add/Edit Link Form */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">
              {editingLink ? 'Link Redaktə Et' : 'Yeni Link Əlavə Et'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkTitle">Başlıq *</Label>
                  <Input
                    id="linkTitle"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Link başlığını daxil edin"
                    disabled={isSubmitting}
                    // required
                  />
                </div>
                
                <div>
                  <Label htmlFor="linkUrl">URL *</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    disabled={isSubmitting}
                    // required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="linkCategory">Kateqoriya</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="linkDescription">Təsvir</Label>
                <Textarea
                  id="linkDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Link haqqında qısa məlumat"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingLink ? 'Yenilənir...' : 'Əlavə edilir...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingLink ? 'Linki Yenilə' : 'Link Əlavə Et'}
                    </>
                  )}
                </Button>
                
                {editingLink && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                    Ləğv et
                  </Button>
                )}
              </div>
            </form>
          </div>
          
          {/* Links List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Mövcud Linklər ({links.length})
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Yüklənir...</span>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hələ heç bir link əlavə edilməyib</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <div 
                    key={link.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      editingLink?.id === link.id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{link.title}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {getCategoryLabel(link.category || 'general')}
                        </span>
                      </div>
                      <div className="text-sm text-blue-600 mb-1">{link.url}</div>
                      {link.description && (
                        <div className="text-xs text-muted-foreground">{link.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Yaradılıb: {new Date(link.created_at).toLocaleDateString('az')}
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(link.url, '_blank')}
                        title="Linki aç"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(link)}
                        title="Linki redaktə et"
                        disabled={isSubmitting}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(link)}
                        title="Linki sil"
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolLinksDialog;
