
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar, User, Building, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ApprovalStatusBadge from './ApprovalStatusBadge';
import { DataEntryStatus } from '@/types/dataEntry';

interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: DataEntryStatus;
  entries: any[];
  completionRate: number;
}

interface ApprovalDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  item: ApprovalItem | null;
}

const ApprovalDetails: React.FC<ApprovalDetailsProps> = ({
  isOpen,
  onClose,
  item
}) => {
  const { t } = useLanguage();

  if (!item) return null;

  const getStatusIcon = (status: DataEntryStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('approvalDetails')}
          </DialogTitle>
          <DialogDescription>
            {t('viewApprovalItemDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('category')}</div>
                  <div className="mt-1 font-medium">{item.categoryName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('school')}</div>
                  <div className="mt-1 font-medium flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {item.schoolName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('submittedAt')}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(item.submittedAt), 'PPP p')}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('submittedBy')}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {item.submittedBy}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('status')}</div>
                  <div className="mt-1">
                    <ApprovalStatusBadge status={item.status} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">{t('completionRate')}</div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-lg font-bold">
                      {Math.round(item.completionRate)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Entries Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('dataEntriesSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {item.entries?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('totalEntries')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {item.entries?.filter(e => e.status === 'pending').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('pending')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {item.entries?.filter(e => e.status === 'approved').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('approved')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {item.entries?.filter(e => e.status === 'rejected').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('rejected')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries Preview */}
          {item.entries && item.entries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('recentEntries')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.entries.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium truncate">
                          {entry.column_id} 
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {entry.value || t('noValue')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(entry.status)}
                        <span className="text-sm">
                          {t(entry.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {item.entries.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      {t('andMoreEntries', { count: item.entries.length - 5 })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetails;
