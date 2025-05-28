
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SchoolStat } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface SchoolsCompletionListProps {
  schools: SchoolStat[];
  showCard?: boolean;
}

const SchoolsCompletionList: React.FC<SchoolsCompletionListProps> = ({ schools, showCard = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSchoolClick = (id: string) => {
    navigate(`/schools/${id}`);
  };
  
  const content = (
    <div className="space-y-4">
      {schools && schools.length > 0 ? (
        schools.map((school) => (
          <div 
            key={school.id}
            className="space-y-1 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
            onClick={() => handleSchoolClick(school.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">{school.name}</h3>
              <span className="text-sm font-medium">{school.completionRate}%</span>
            </div>
            <Progress value={school.completionRate} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('totalEntries')}: {school.totalEntries || school.total_entries || 0}</span>
              <span>{t('pending')}: {school.pendingEntries || school.pending_entries || school.pendingCount || 0}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p>{t('noSchoolData')}</p>
        </div>
      )}
    </div>
  );
  
  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('schoolsCompletion')}</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }
  
  return content;
};

export default SchoolsCompletionList;
