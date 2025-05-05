
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ReportTypeValues } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';

export interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    type: string;
  }) => Promise<void>;
}

export const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>(ReportTypeValues.BAR);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string; type?: string }>({});

  const validate = () => {
    const newErrors: { title?: string; description?: string; type?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = t('titleRequired');
    }
    
    if (!description.trim()) {
      newErrors.description = t('descriptionRequired');
    }
    
    if (!type) {
      newErrors.type = t('typeRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onCreate({ 
        title: title.trim(), 
        description: description.trim(), 
        type 
      });
      resetForm();
      onClose();
      toast.success(t('reportCreated'));
    } catch (err) {
      console.error('Error creating report:', err);
      toast.error(t('reportCreationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType(ReportTypeValues.BAR);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewReport')}</DialogTitle>
          <DialogDescription>
            {t('createNewReportDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('reportTitle')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-red-500" : ""}
              placeholder={t('reportTitlePlaceholder')}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('reportDescription')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              placeholder={t('reportDescriptionPlaceholder')}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">{t('reportType')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder={t('selectReportType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportTypeValues.BAR}>{t('statistics')}</SelectItem>
                <SelectItem value={ReportTypeValues.PIE}>{t('completion')}</SelectItem>
                <SelectItem value={ReportTypeValues.LINE}>{t('comparison')}</SelectItem>
                <SelectItem value={ReportTypeValues.TABLE}>{t('column')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {t('creating')}
              </>
            ) : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
