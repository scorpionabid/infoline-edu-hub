
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { SchoolStat } from '@/types/dashboard';

interface SchoolsCompletionListProps {
  schools: SchoolStat[];
}

const SchoolsCompletionList: React.FC<SchoolsCompletionListProps> = ({ schools }) => {
  const sortedSchools = [...schools].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-4">
      {sortedSchools.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Məlumat yoxdur
        </div>
      ) : (
        sortedSchools.slice(0, 5).map((school) => (
          <div key={school.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate" title={school.name}>
                {school.name}
              </span>
              <span className="text-xs">{school.completionRate}%</span>
            </div>
            <Progress value={school.completionRate} className="h-1" />
          </div>
        ))
      )}
    </div>
  );
};

export default SchoolsCompletionList;
