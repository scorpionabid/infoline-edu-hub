
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormFieldHelpProps {
  text: string;
}

const FormFieldHelp: React.FC<FormFieldHelpProps> = ({ text }) => {
  if (!text) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex ml-1 text-muted-foreground cursor-help">
            <HelpCircle size={14} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FormFieldHelp;
