
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Report, ReportPreviewDialogProps } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate } from '@/lib/utils';

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({ 
  open, 
  onOpenChange,
  report: initialReport,
  reportId,
  onClose
}) => {
  const { t } = useLanguage();
  const [report, setReport] = useState<Report | undefined>(initialReport);
  
  const { data, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      // Replace with your actual API call to fetch the report
      // const { data } = await supabase.from('reports').select('*').eq('id', reportId).single();
      // return data as Report;
      
      // Mock data for example
      return {
        id: reportId,
        title: 'Sample Report',
        description: 'This is a sample report description',
        type: 'BAR' as keyof typeof import('@/types/report').ReportTypeValues,
        content: {},
        status: 'published' as import('@/types/report').ReportStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        insights: ['Good performance in reading', 'Math scores need improvement'],
        recommendations: ['Focus more on mathematics', 'Continue reading program']
      } as Report;
    },
    enabled: open && !!reportId && !initialReport
  });
  
  useEffect(() => {
    if (data) {
      setReport(data);
    } else if (initialReport) {
      setReport(initialReport);
    }
  }, [data, initialReport]);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const renderInsights = () => {
    if (!report?.insights) return null;
    
    let insightsList: string[] = [];
    
    if (Array.isArray(report.insights)) {
      insightsList = report.insights;
    } else if (typeof report.insights === 'string') {
      insightsList = [report.insights];
    }
        
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('insights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            {insightsList.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };
  
  const renderRecommendations = () => {
    if (!report?.recommendations) return null;
    
    let recommendationsList: string[] = [];
    
    if (Array.isArray(report.recommendations)) {
      recommendationsList = report.recommendations;
    } else if (typeof report.recommendations === 'string') {
      recommendationsList = [report.recommendations];
    }
        
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('recommendations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            {recommendationsList.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isLoading || !report ? (
          <>
            <DialogHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </DialogHeader>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{report.title}</DialogTitle>
              <DialogDescription>
                {report.description || t('noDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium">{t('reportType')}</p>
                <p className="text-sm text-muted-foreground">{report.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('reportStatus')}</p>
                <p className="text-sm text-muted-foreground">{report.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('createdAt')}</p>
                <p className="text-sm text-muted-foreground">{formatDate(report.created_at)}</p>
              </div>
              {report.updated_at && (
                <div>
                  <p className="text-sm font-medium">{t('updatedAt')}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(report.updated_at)}</p>
                </div>
              )}
            </div>
            
            {renderInsights()}
            {renderRecommendations()}
            
            {report.content && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('content')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(report.content, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
