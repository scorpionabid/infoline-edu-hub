
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { CreateReportDialogProps } from '@/types/report';

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({ 
  open, 
  onClose,
  onCreate 
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (onCreate) {
        await onCreate({ title, description, type });
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('standard');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewReport')}</DialogTitle>
          <DialogDescription>
            {t('createReportDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">{t('title')}</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('reportTitlePlaceholder')}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">{t('description')}</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reportDescriptionPlaceholder')}
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">{t('reportType')}</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectReportType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('standardReport')}</SelectItem>
                <SelectItem value="analytics">{t('analyticsReport')}</SelectItem>
                <SelectItem value="summary">{t('summaryReport')}</SelectItem>
                <SelectItem value="custom">{t('customReport')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
            {isSubmitting ? t('creating') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
