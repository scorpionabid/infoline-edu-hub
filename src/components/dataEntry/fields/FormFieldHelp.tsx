
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormFieldHelpProps {
  helpText: string;
}

const FormFieldHelp: React.FC<FormFieldHelpProps> = ({ helpText }) => {
  if (!helpText) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{helpText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FormFieldHelp;
