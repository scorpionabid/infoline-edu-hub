import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FormActionBarProps {
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  isSaving?: boolean;
  isSubmitting?: boolean;
  hasUnsavedChanges?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export const FormActionBar: React.FC<FormActionBarProps> = ({
  onSave,
  onSubmit,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
  isSaving = false,
  isSubmitting = false,
  hasUnsavedChanges = false,
  currentIndex,
  // totalCount
}) => {
  return (
    <Card className="sticky bottom-4 bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            {onPrevious && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!canPrevious}
              >
                ← Əvvəlki
              </Button>
            )}
            
            {currentIndex !== undefined && totalCount !== undefined && (
              <div className="px-3 py-1 bg-gray-100 rounded-md text-sm">
                {currentIndex + 1} / {totalCount}
              </div>
            )}
            
            {onNext && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!canNext}
              >
                Növbəti →
              </Button>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                ⚠️ Yadda saxlanmamış dəyişikliklər
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isSaving || isSubmitting}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-primary mr-2" />
                    Yadda saxlanır...
                  </>
                ) : (
                  <>💾 Yadda saxla</>
                )}
              </Button>
            )}
            
            {onSubmit && (
              <Button
                size="sm"
                onClick={onSubmit}
                disabled={isSaving || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-white mr-2" />
                    Göndərilir...
                  </>
                ) : (
                  <>📤 Təsdiq üçün göndər</>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};