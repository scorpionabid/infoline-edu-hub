
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Report, ReportType } from '@/types/report';
import { useReports } from '@/hooks/useReports';
import { toast } from 'sonner';

interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({ open, onClose }) => {
  const { t } = useLanguage();
  const { addReport } = useReports();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReportType>('statistics');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error(t('titleRequired'));
      return;
    }
    
    setLoading(true);
    
    try {
      const report: Partial<Report> = {
        name: title,
        description,
        type,
        status: 'draft'
      };
      
      const newReport = await addReport(report);
      
      if (newReport) {
        toast.success(t('reportCreated'));
        handleClose();
      }
    } catch (error) {
      console.error('Hesabat yaradılarkən xəta:', error);
      toast.error(t('errorCreatingReport'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('statistics');
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('createNewReport')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('reportTitle')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('enterReportTitle')}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('enterReportDescription')}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">{t('reportType')}</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectReportType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statistics">{t('statistics')}</SelectItem>
                  <SelectItem value="completion">{t('completion')}</SelectItem>
                  <SelectItem value="comparison">{t('comparison')}</SelectItem>
                  <SelectItem value="column">{t('column')}</SelectItem>
                  <SelectItem value="category">{t('category')}</SelectItem>
                  <SelectItem value="school">{t('school')}</SelectItem>
                  <SelectItem value="region">{t('region')}</SelectItem>
                  <SelectItem value="sector">{t('sector')}</SelectItem>
                  <SelectItem value="custom">{t('custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('creating') : t('createReport')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportDialog;
