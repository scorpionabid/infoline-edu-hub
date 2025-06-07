
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarDays, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CategoryHeaderProps {
  name: string;
  description: string;
  deadline?: string | null;
  completionPercentage?: number;
  isSubmitted?: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  name,
  description,
  deadline,
  completionPercentage = 0,
  isSubmitted = false
}) => {
  const { t } = useLanguage();
  
  // Son tarixi formatlamaq
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString() : null;
  
  // Son tarixə neçə gün qaldığını hesablamaq
  const getDaysLeft = (): number | null => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysLeft = getDaysLeft();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {deadline && (
          <div className="flex items-center gap-1 text-sm bg-muted px-3 py-1 rounded-md">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{t('deadline')}: {formattedDeadline}</span>
            {daysLeft !== null && (
              <span 
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  daysLeft < 0 
                    ? 'bg-red-100 text-red-800' 
                    : daysLeft <= 3 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {daysLeft < 0 
                  ? `${Math.abs(daysLeft)} ${t('daysAgo')}` 
                  : `${daysLeft} ${t('daysLeft')}`}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{t('progress')}</span>
            <span className="text-sm font-medium">
              {Math.round(completionPercentage)}% {t('tamamlandi')}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        {isSubmitted && (
          <div className="flex items-center text-sm text-green-600 font-medium gap-1 ml-4">
            <CheckCircle className="h-4 w-4" />
            {t('formSubmitted')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;
