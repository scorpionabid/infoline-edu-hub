
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { StatusCardsProps } from '@/types/dashboard';

const StatusCards: React.FC<StatusCardsProps> = ({ 
  status, 
  completion,
  formStats 
}) => {
  const { t } = useLanguage();

  const completionPercentage = completion ? Math.round(completion.percentage) : 0;
  const approvalPercentage = status.total > 0 
    ? Math.round((status.approved / status.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t('completionRate')}
            </p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{completionPercentage}%</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>{completion.completed}/{completion.total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {t('approved')}
            </p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{status.approved}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>{approvalPercentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {t('pending')}
            </p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{status.pending}</h3>
              {formStats && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span>{formStats.dueSoon} {t('dueSoon')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {t('rejected')}
            </p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{status.rejected}</h3>
              {formStats && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span>{formStats.overdue} {t('overdue')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;
