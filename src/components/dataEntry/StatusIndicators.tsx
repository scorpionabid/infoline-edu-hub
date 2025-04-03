
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ColumnValidationError } from '@/types/dataEntry';

interface StatusIndicatorsProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'submitted';
  errors?: ColumnValidationError[];
  isSubmitAttempted?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorsProps> = ({ 
  status, 
  errors = [], 
  isSubmitAttempted = false 
}) => {
  let icon;
  let label;
  let variant: "outline" | "destructive" | "default" | "secondary" | "success" = "outline";
  let tooltipText = "";

  switch(status) {
    case 'draft':
      icon = <Clock className="h-4 w-4 mr-1" />;
      label = 'Hazırlanır';
      variant = "outline";
      tooltipText = "Məlumat hələ daxil edilir";
      break;
    case 'submitted':
    case 'pending':
      icon = <Clock className="h-4 w-4 mr-1 text-amber-500" />;
      label = 'Təsdiqlənməyi gözləyir';
      variant = "secondary";
      tooltipText = "Məlumat təqdim edilib və təsdiqlənməyi gözləyir";
      break;
    case 'approved':
      icon = <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />;
      label = 'Təsdiqlənib';
      variant = "success";
      tooltipText = "Məlumat təsdiqlənib";
      break;
    case 'rejected':
      icon = <XCircle className="h-4 w-4 mr-1 text-red-500" />;
      label = 'Rədd edilib';
      variant = "destructive";
      tooltipText = "Məlumat rədd edilib, düzəlişlər tələb olunur";
      break;
    default:
      icon = <Clock className="h-4 w-4 mr-1" />;
      label = 'Hazırlanır';
      variant = "outline";
  }

  // Error indicator
  const errorIndicator = errors.length > 0 && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.length}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <div className="font-semibold mb-1">Xətalar:</div>
            <ul className="list-disc pl-4 text-sm">
              {errors.slice(0, 3).map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
              {errors.length > 3 && <li>...və digər {errors.length - 3} xəta</li>}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={variant} className="flex items-center">
              {icon}
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {errorIndicator}
    </div>
  );
};

export default StatusIndicator;
