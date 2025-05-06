
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { School } from '@/types/school';
import { supabase } from '@/integrations/supabase/client';

interface AdminDialogProps {
  school: School | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function AdminDialog({ school, open, onClose, onRefresh }: AdminDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingAdmin, setExistingAdmin] = useState(false);
  
  useEffect(() => {
    if (open && school) {
      setEmail(school.admin_email || '');
      setExistingAdmin(!!school.admin_id);
    }
  }, [open, school]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!school) return;
    
    setIsSubmitting(true);
    
    try {
      // Açıq bir şəkildə admin_email istifadə edirik
      await supabase
        .from('schools')
        .update({ admin_email: email })
        .eq('id', school.id);
      
      if (!existingAdmin) {
        // Mövcud admin yoxdursa, yeni məktəb admini yaradırıq
        // Bu misalda sadəcə e-poçtu saxlayırıq, real tətbiqdə bunun üzərində daha çox iş görüləcək
      }
      
      toast({
        title: t('success'),
        description: t('schoolAdminAssigned')
      });
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast({
        title: t('error'),
        description: t('errorAssigningAdmin'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingAdmin ? t('changeSchoolAdmin') : t('assignSchoolAdmin')}
          </DialogTitle>
          <DialogDescription>
            {t('schoolAdminDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">{t('school')}</Label>
            <Input id="schoolName" value={school?.name || ''} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminEmail">{t('adminEmail')}</Label>
            <Input 
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : existingAdmin ? t('change') : t('assign')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
