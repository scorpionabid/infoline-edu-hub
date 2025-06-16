import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface LinkCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  onSuccess?: () => void;
}

interface LinkFormData {
  title: string;
  url: string;
  description: string;
  category: string;
  isActive: boolean;
}

export const LinkCreationDialog: React.FC<LinkCreationDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    category: 'general',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      toast.error(t('Başlıq və URL tələb olunur'));
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement actual API call to create link
      // await linkService.createLink(schoolId, formData);
      
      console.log('Creating link for school:', schoolId, formData);
      
      toast.success(t('Link uğurla yaradıldı'));
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'general',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to create link:', error);
      toast.error(t('Link yaradılarkən xəta baş verdi'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('Yeni Link Yaradın')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('Başlıq')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('Link başlığını daxil edin')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">{t('URL')} *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('Təsvir')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('Link haqqında qısa məlumat')}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">{t('Kateqoriya')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('Ümumi')}</SelectItem>
                  <SelectItem value="education">{t('Təhsil')}</SelectItem>
                  <SelectItem value="forms">{t('Formlar')}</SelectItem>
                  <SelectItem value="reports">{t('Hesabatlar')}</SelectItem>
                  <SelectItem value="resources">{t('Resurslar')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('Ləğv et')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('Yaradılır...') : t('Link Yarat')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkCreationDialog;
