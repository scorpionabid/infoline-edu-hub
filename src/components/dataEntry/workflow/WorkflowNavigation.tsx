
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

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
  const { t } = useTranslation();

  const getNextLabel = () => {
    if (nextLabel) return nextLabel;
    
    switch (currentStep) {
      case 'mode':
        return t('dataEntry.workflow.next_to_context');
      case 'context':
        return t('dataEntry.workflow.next_to_target');
      case 'target':
        return t('dataEntry.workflow.next_to_input');
      case 'input':
        return t('dataEntry.workflow.complete');
      default:
        return t('common.next');
    }
  };

  const getBackLabel = () => {
    if (backLabel) return backLabel;
    return t('dataEntry.workflow.back');
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
                {t('dataEntry.workflow.cancel')}
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
              {currentStep === 'mode' && t('dataEntry.workflow.select_mode')}
              {currentStep === 'context' && t('dataEntry.workflow.select_category')}
              {currentStep === 'target' && t('dataEntry.workflow.select_school')}
              {currentStep === 'input' && t('dataEntry.workflow.enter_data')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
