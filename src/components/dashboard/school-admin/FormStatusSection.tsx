import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FormStatusSectionProps {
  dashboardData?: any;
  // Add other props as needed
}

export const FormStatusSection: React.FC<FormStatusSectionProps> = ({ dashboardData }) => {
  // Mock data for demonstration
  const totalForms = 100;
  const completedForms = 75;
  const completionPercentage = (completedForms / totalForms) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Completed Forms</span>
            <Badge>{completedForms}/{totalForms}</Badge>
          </div>
          <Progress value={completionPercentage} />
          <p className="text-sm text-muted-foreground">
            {completionPercentage.toFixed(2)}% completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormStatusSection;
