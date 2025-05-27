import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface ApprovalItemProps {
  approval: {
    id: string;
    schoolName: string;
    categoryName: string;
    submittedAt?: string;
    date: string;
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ 
  approval, 
  onApprove, 
  onReject, 
  onView 
}) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{approval.schoolName}</h3>
            <p className="text-sm text-muted-foreground">{approval.categoryName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('submittedAt')}: {approval.submittedAt || approval.date}
            </p>
          </div>
          <div>
            <button 
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 mr-2"
              onClick={() => onApprove(approval.id)}
            >
              {t('approve')}
            </button>
            <button 
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 mr-2"
              onClick={() => onReject(approval.id)}
            >
              {t('reject')}
            </button>
            <button 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
              onClick={() => onView(approval.id)}
            >
              {t('view')}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalItem;
