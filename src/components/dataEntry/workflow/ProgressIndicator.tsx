import React from 'react';
import { cn } from '@/lib/utils';
import { Target, Settings, School, Edit3, CheckCircle, Circle } from 'lucide-react';

interface ProgressStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface ProgressIndicatorProps {
  currentStep: string;
  completedSteps: string[];
  mode?: 'single' | 'bulk';
  className?: string;
  
  // 🆕 Yeni parametr
  entryType?: 'school' | 'sector';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSteps,
  mode = 'single',
  className,
  
  // 🆕 Yeni parametr
  entryType = 'school'
}) => {
  // 🆕 Sector mode-da target step skip edilir
  const allSteps: ProgressStep[] = [
    { 
      key: 'mode', 
      label: 'Rejim Seçimi', 
      icon: <Target className="h-4 w-4" />,
      description: 'Tək və ya bulk məlumat daxil etmə'
    },
    { 
      key: 'context', 
      label: 'Kateqoriya & Sütun', 
      icon: <Settings className="h-4 w-4" />,
      description: 'Məlumat novünün mueyyen edilməsi'
    },
    { 
      key: 'target', 
      label: mode === 'single' ? 'Məktəb Seçimi' : 'Məktəblər Seçimi',
      icon: <School className="h-4 w-4" />,
      description: mode === 'single' ? 'Məktəbin seçilməsi' : 'Çoxlu məktəbin seçilməsi'
    },
    { 
      key: 'input', 
      label: entryType === 'sector' ? 'Sektor Məlumat' : 'Məlumat Daxil Etmə', 
      icon: <Edit3 className="h-4 w-4" />,
      description: entryType === 'sector' 
        ? 'Sektor üçün məlumat daxil etmə'
        : 'Məlumatların daxil edilməsi və təsdiqlenməsi'
    }
  ];
  
  // Sector mode-da target step-i çıxar
  const steps: ProgressStep[] = entryType === 'sector' 
    ? allSteps.filter(step => step.key !== 'target')
    : allSteps;

  const getStepStatus = (stepKey: string) => {
    if (completedSteps.includes(stepKey)) {
      return 'completed';
    } else if (currentStep === stepKey) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const getCompletedStepIndex = () => {
    return Math.max(...completedSteps.map(stepKey => 
      steps.findIndex(step => step.key === stepKey)
    ), -1);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-muted"></div>
        
        {/* Progress Line */}
        <div 
          className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${((getCompletedStepIndex() + 1) / (steps.length - 1)) * 100}%`
          }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.key);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    {
                      'bg-primary border-primary text-primary-foreground': status === 'completed',
                      'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20': status === 'current',
                      'bg-background border-muted-foreground/30 text-muted-foreground': status === 'pending'
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      {
                        'text-primary': status === 'completed' || status === 'current',
                        'text-muted-foreground': status === 'pending'
                      }
                    )}
                  >
                    {step.label}
                  </div>
                  
                  {/* Step Description */}
                  <div
                    className={cn(
                      "text-xs mt-1 transition-colors duration-300 max-w-24 mx-auto",
                      {
                        'text-primary/70': status === 'completed' || status === 'current',
                        'text-muted-foreground/70': status === 'pending'
                      }
                    )}
                  >
                    {step.description}
                  </div>
                </div>

                {/* Step Status Indicator */}
                {status === 'current' && (
                  <div className="absolute -bottom-2 flex items-center gap-1">
                    <Circle className="h-2 w-2 fill-primary text-primary animate-pulse" />
                    <Circle className="h-2 w-2 fill-primary/60 text-primary/60 animate-pulse delay-150" />
                    <Circle className="h-2 w-2 fill-primary/30 text-primary/30 animate-pulse delay-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="mt-8 text-center">
        {getCurrentStepIndex() >= 0 && (
          <div className="space-y-2">
            <div className="text-lg font-medium text-primary">
              {steps[getCurrentStepIndex()]?.label}
            </div>
            <div className="text-sm text-muted-foreground">
              Addim {getCurrentStepIndex() + 1} / {steps.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};