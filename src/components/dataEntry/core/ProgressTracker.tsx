
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Column } from '@/types/column';

interface ProgressTrackerProps {
  columns: Column[];
  formData: Record<string, any>;
  completionPercentage: number;
  hasAllRequiredFields: boolean;
  isValid: boolean;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  columns,
  formData,
  completionPercentage,
  hasAllRequiredFields,
  isValid,
  className = ''
}) => {
  const filledFields = columns.filter(column => {
    const value = formData[column.id];
    return value && String(value).trim() !== '';
  }).length;

  const requiredFields = columns.filter(col => col.is_required).length;
  const filledRequiredFields = columns.filter(col => {
    if (!col.is_required) return false;
    const value = formData[col.id];
    return value && String(value).trim() !== '';
  }).length;

  const getStatusIcon = () => {
    if (hasAllRequiredFields && isValid) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (completionPercentage > 0) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (hasAllRequiredFields && isValid) {
      return 'Ready for submission';
    }
    if (completionPercentage > 0) {
      return 'In progress';
    }
    return 'Not started';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon()}
          Form Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Overall Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Filled Fields</div>
            <div className="font-medium">{filledFields} / {columns.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Required Fields</div>
            <div className="font-medium">{filledRequiredFields} / {requiredFields}</div>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium">{getStatusText()}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
