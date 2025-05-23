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
import { CreateReportDialogProps, REPORT_TYPE_VALUES, ReportTypeValues } from '@/types/report';

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({ 
  open, 
  isOpen,
  onOpenChange,
  onCreate,
  onSubmit,
  onClose
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReportTypeValues>(REPORT_TYPE_VALUES.BAR);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogOpen = open !== undefined ? open : isOpen;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const reportData = { title, description, type };
      if (onCreate) {
        await onCreate(reportData);
      } else if (onSubmit) {
        await onSubmit(reportData);
      }
      resetForm();
      handleClose();
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    if (onClose) {
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType(REPORT_TYPE_VALUES.BAR);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(newOpen) => !newOpen && handleClose()}>
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
            <Select 
              value={type} 
              onValueChange={(value: ReportTypeValues) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectReportType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REPORT_TYPE_VALUES.BAR}>{t('barChart')}</SelectItem>
                <SelectItem value={REPORT_TYPE_VALUES.LINE}>{t('lineChart')}</SelectItem>
                <SelectItem value={REPORT_TYPE_VALUES.PIE}>{t('pieChart')}</SelectItem>
                <SelectItem value={REPORT_TYPE_VALUES.TABLE}>{t('tableReport')}</SelectItem>
                <SelectItem value={REPORT_TYPE_VALUES.METRICS}>{t('metricsReport')}</SelectItem>
                <SelectItem value={REPORT_TYPE_VALUES.CUSTOM}>{t('customReport')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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
