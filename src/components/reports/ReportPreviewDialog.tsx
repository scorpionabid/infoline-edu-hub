
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Report } from '@/types/report';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Download, Share2, Edit } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ReportChart from './ReportChart';
import { useUsers } from '@/hooks/useUsers';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReportPreviewDialogProps {
  report: Report;
  open: boolean;
  onClose: () => void;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({ report, open, onClose }) => {
  const { t } = useLanguage();
  const { downloadReport, shareReport } = useReports();
  const { users, isLoading: usersLoading } = useUsers();
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const handleDownload = async () => {
    const url = await downloadReport(report.id);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  const handleShareReport = async () => {
    if (!shareEmail.trim()) {
      toast.error('Email daxil edin');
      return;
    }
    
    // E-maili təsdiqləyən sadə regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      toast.error('Düzgün email formatı daxil edin');
      return;
    }
    
    setIsSharing(true);
    
    // Emailə görə istifadəçini tapaq
    const userToShare = users.find(u => u.email === shareEmail);
    
    if (!userToShare) {
      toast.error('Bu email ünvanı ilə istifadəçi tapılmadı');
      setIsSharing(false);
      return;
    }
    
    try {
      const shared = await shareReport(report.id, [userToShare.id]);
      if (shared) {
        toast.success('Hesabat uğurla paylaşıldı');
        setShareEmail('');
        setIsSharePopoverOpen(false);
      }
    } catch (error) {
      toast.error('Hesabat paylaşılarkən xəta baş verdi');
      console.error('Paylaşma xətası:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  // Hesabat növü tərcüməsi
  const getReportTypeTranslation = (type: string): string => {
    switch (type) {
      case 'statistics':
        return t('statistics');
      case 'completion':
        return t('completion');
      case 'comparison':
        return t('comparison');
      case 'column':
        return t('column');
      case 'category':
        return t('category');
      case 'school':
        return t('school');
      case 'region':
        return t('region');
      case 'sector':
        return t('sector');
      case 'custom':
        return t('custom');
      default:
        return type;
    }
  };
  
  // Hesabat statusu tərcüməsi
  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">{t('published')}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t('archived')}</Badge>;
      default:
        return <Badge>{t('draft')}</Badge>;
    }
  };
  
  // Formatlanmış tarix
  const formattedDate = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return formatRelative(date, new Date());
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{report.title || report.name}</span>
            {getReportStatusBadge(report.status)}
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{getReportTypeTranslation(report.type)}</span>
            <span>•</span>
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formattedDate(report.createdAt || report.created || report.dateCreated)}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Hesabat təsviri */}
          <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
          
          <Separator className="my-4" />
          
          {/* Hesabat məlumatları */}
          <div className="space-y-4">
            {/* Hesabat qrafiki */}
            <Card>
              <CardContent className="p-4">
                <ReportChart report={report} />
              </CardContent>
            </Card>
            
            {/* Əgər varsa, əlavə məlumatlar */}
            {report.insights && report.insights.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">{t('insights')}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {report.insights.map((insight, index) => (
                    <li key={index} className="text-sm">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Əgər varsa, tövsiyələr */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">{t('recommendations')}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
            
            <Popover open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('share')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">{t('shareReport')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('enterEmailToShare')}
                  </p>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="info@example.com" 
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleShareReport}
                      disabled={isSharing || !shareEmail.trim()}
                    >
                      {isSharing ? t('sharing') : t('share')}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t('download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
