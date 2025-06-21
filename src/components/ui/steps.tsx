import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepsProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({
  currentStep,
  steps,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  {
                    "bg-primary border-primary text-primary-foreground": isActive,
                    "bg-primary border-primary text-primary-foreground": isCompleted,
                    "bg-background border-muted-foreground text-muted-foreground": !isActive && !isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-primary": isActive,
                      "text-foreground": isCompleted,
                      "text-muted-foreground": !isActive && !isCompleted,
                    }
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    "h-0.5 transition-colors",
                    {
                      "bg-primary": isCompleted,
                      "bg-muted": !isCompleted,
                    }
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Steps;
