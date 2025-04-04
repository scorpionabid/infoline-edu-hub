
import React, { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            onClick={() => setIsOpen(prev => !prev)}
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Kömək
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px] text-sm">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FormFieldHelp;
