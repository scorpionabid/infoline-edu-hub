
import React from 'react';
import { DeadlineItem } from '@/types/dashboard';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UpcomingDeadlinesListProps {
  deadlines: DeadlineItem[];
}

const UpcomingDeadlinesList: React.FC<UpcomingDeadlinesListProps> = ({ deadlines }) => {
  const { t } = useLanguage();

  // Sort deadlines by closest first
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    return dateA.getTime() - dateB.getTime();
  });

  const getTimeRemaining = (deadline: string) => {
    try {
      return formatDistanceToNow(parseISO(deadline), { addSuffix: true });
    } catch (e) {
      return deadline;
    }
  };

  const getUrgencyClass = (daysLeft?: number) => {
    if (!daysLeft) return '';
    
    if (daysLeft <= 2) return 'bg-red-100 text-red-800 hover:bg-red-200';
    if (daysLeft <= 7) return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  };

  return (
    <div className="space-y-4">
      {sortedDeadlines.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          {t('noUpcomingDeadlines')}
        </div>
      ) : (
        sortedDeadlines.map((deadline) => (
          <div key={deadline.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <div className="font-medium">{deadline.title}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining(deadline.deadline)}
              </div>
            </div>
            <Badge variant="outline" className={getUrgencyClass(deadline.daysLeft)}>
              {deadline.daysLeft !== undefined ? `${deadline.daysLeft} ${t('days')}` : t('upcoming')}
            </Badge>
          </div>
        ))
      )}
    </div>
  );
};

export default UpcomingDeadlinesList;
