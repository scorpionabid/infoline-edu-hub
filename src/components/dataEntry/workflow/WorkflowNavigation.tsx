import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface WorkflowNavigationProps {
  currentStep: string;
  canProceed: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
}

export const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  currentStep,
  canProceed,
  canGoBack,
  onNext,
  onBack,
  onCancel,
  isLoading = false,
  errorMessage,
  nextLabel,
  backLabel,
  className
}) => {
  const getNextLabel = () => {
    if (nextLabel) return nextLabel;
    
    switch (currentStep) {
      case 'mode':
        return 'Kateqoriya Secimine Kec';
      case 'context':
        return 'Mekteb Secimine Kec';
      case 'target':
        return 'Melumat Daxil Etmeye Kec';
      case 'input':
        return 'Tamamla';
      default:
        return 'Novbeti';
    }
  };

  const getBackLabel = () => {
    if (backLabel) return backLabel;
    return 'Geri';
  };

  return (
    <Card className={className}>
      <CardContent className="py-4">
        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{errorMessage}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Side - Back & Cancel */}
          <div className="flex items-center gap-2">
            {canGoBack && (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {getBackLabel()}
              </Button>
            )}
            
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="text-muted-foreground"
              >
                Legv et
              </Button>
            )}
          </div>

          {/* Right Side - Next */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onNext}
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2"
            >
              {getNextLabel()}
              {currentStep !== 'input' && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Help Text */}
        {!canProceed && !errorMessage && (
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground">
              {currentStep === 'mode' && 'Rejim secmek lazimdir'}
              {currentStep === 'context' && 'Kateqoriya ve sutun secmek lazimdir'}
              {currentStep === 'target' && 'En azi bir mekteb secmek lazimdir'}
              {currentStep === 'input' && 'Melumat daxil etmek lazimdir'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};