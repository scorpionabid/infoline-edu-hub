import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleIcon } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
  status?: 'completed' | 'current' | 'upcoming';
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <ol className="flex items-center w-full space-x-2 md:space-x-4">
        {steps.map((step, index) => {
          const status = 
            step.id < currentStep 
              ? 'completed' 
              : step.id === currentStep 
                ? 'current' 
                : 'upcoming';
                
          return (
            <li 
              key={step.id} 
              className={cn(
                'flex items-center space-x-2 md:space-x-3', 
                index < steps.length - 1 ? 'flex-1' : '',
              )}
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full',
                  status === 'completed' ? 'bg-primary text-primary-foreground' : 
                  status === 'current' ? 'bg-primary/20 text-primary border border-primary' : 
                  'bg-muted text-muted-foreground'
                )}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span 
                  className={cn(
                    'text-xs mt-1 text-center',
                    status === 'completed' ? 'text-primary' : 
                    status === 'current' ? 'text-primary font-medium' : 
                    'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    'flex-1 h-0.5',
                    index < currentStep - 1 ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
