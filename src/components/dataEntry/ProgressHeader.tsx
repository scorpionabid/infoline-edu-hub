import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { School } from 'lucide-react';

interface ProgressHeaderProps {
  schoolName?: string;
  overallProgress: number;
  categoriesCompleted: number;
  totalCategories: number;
  isSectorAdmin?: boolean;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  schoolName,
  overallProgress,
  categoriesCompleted,
  totalCategories,
  isSectorAdmin = false
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Məlumat Daxiletməsi</h1>
            {isSectorAdmin && schoolName && (
              <div className="flex items-center gap-2 text-gray-600">
                <School className="w-4 h-4" />
                <span className="text-sm">{schoolName}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-xs text-gray-600">Ümumi tamamlanma</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{categoriesCompleted} / {totalCategories} kateqoriya tamamlandı</span>
            <span>
              {overallProgress === 100 ? "✅ Tamamlandı" : 
               overallProgress > 0 ? "🔄 Davam edir" : "🔲 Başlanmayıb"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};