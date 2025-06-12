import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  Menu,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/common/useResponsive';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import { useRealTimeValidation } from '@/hooks/dataEntry/common/useRealTimeValidation';
import EnhancedFormField from './fields/EnhancedFormField';
import AutoSaveIndicator from './core/AutoSaveIndicator';
import { Column } from '@/types/column';

interface MobileOptimizedDataEntryProps {
  categoryId: string;
  schoolId: string;
  userId?: string;
  columns: Column[];
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

/**
 * Mobil Cihazlar üçün Optimallaşdırılmış Data Entry Komponenti
 * 
 * Bu komponent aşağıdakı funksiyaları təmin edir:
 * - Touch-optimized interface
 * - Swipe navigation
 * - Mobile-first responsive design
 * - Performance optimizations
 * - Accessibility support
 */
const MobileOptimizedDataEntry: React.FC<MobileOptimizedDataEntryProps> = ({
  categoryId,
  schoolId,
  userId,
  columns,
  formData,
  onChange,
  onSave,
  onSubmit,
  readOnly = false,
  className
}) => {
  const { 
    isMobile, 
    isTablet, 
    isTouchDevice, 
    orientation,
    shouldUseTouchOptimizations,
    getOptimalTouchTarget,
    shouldReduceAnimations
  } = useResponsive();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-save functionality
  const autoSave = useAutoSave({
    categoryId,
    schoolId,
    formData,
    isDataModified: true,
    enabled: !readOnly
  });
  
  // Real-time validation
  const validation = useRealTimeValidation({
    columns,
    formData,
    enabled: true,
    validateOnChange: true,
    debounceMs: isMobile ? 500 : 300 // Longer debounce on mobile
  });
  
  // Split columns into steps for mobile
  const stepsPerPage = isMobile ? 3 : isTablet ? 5 : columns.length;
  const steps = [];
  for (let i = 0; i < columns.length; i += stepsPerPage) {
    steps.push(columns.slice(i, i + stepsPerPage));
  }
  
  // Touch gestures
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    if (isRightSwipe && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle form field changes
  const handleFieldChange = (columnId: string, value: any) => {
    const newFormData = { ...formData, [columnId]: value };
    onChange(newFormData);
    validation.markFieldAsTouched(columnId);
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!validation.isValid) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get current step info
  const currentStepColumns = steps[currentStep] || [];
  const currentStepErrors = currentStepColumns.filter(col => 
    validation.getFieldError(col.id)
  ).length;
  
  // Progress calculation
  const totalProgress = validation.completionPercentage;
  const stepProgress = Math.round(
    (currentStepColumns.filter(col => {
      const value = formData[col.id];
      return value && String(value).trim() !== '';
    }).length / currentStepColumns.length) * 100
  );
  
  // Mobile header
  const MobileHeader = () => (
    <div className={cn(
      "sticky top-0 z-50 bg-background border-b",
      "flex items-center justify-between p-4",
      shouldUseTouchOptimizations && getOptimalTouchTarget()
    )}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMobileMenu(true)}
          className={shouldUseTouchOptimizations ? getOptimalTouchTarget() : ''}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold text-lg">Məlumat Girişi</h2>
          <p className="text-xs text-muted-foreground">
            Addım {currentStep + 1} / {steps.length}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={currentStepErrors > 0 ? "destructive" : "secondary"}>
          {currentStepErrors > 0 ? `${currentStepErrors} xəta` : '✓ Tamam'}
        </Badge>
      </div>
    </div>
  );
  
  // Step navigation
  const StepNavigation = () => (
    <div className={cn(
      "sticky bottom-0 bg-background border-t p-4",
      "flex items-center justify-between"
    )}>
      <Button
        variant="outline"
        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
        className={cn(
          "flex items-center gap-2",
          shouldUseTouchOptimizations && getOptimalTouchTarget()
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Əvvəlki
      </Button>
      
      <div className="flex items-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentStep ? "bg-primary" : "bg-muted",
              isTouchDevice && "w-3 h-3" // Larger dots for touch
            )}
          />
        ))}
      </div>
      
      {currentStep === steps.length - 1 ? (
        <Button
          onClick={handleSubmit}
          disabled={!validation.isValid || isSubmitting}
          className={cn(
            "flex items-center gap-2",
            shouldUseTouchOptimizations && getOptimalTouchTarget()
          )}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Göndərilir...' : 'Göndər'}
        </Button>
      ) : (
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className={cn(
            "flex items-center gap-2",
            shouldUseTouchOptimizations && getOptimalTouchTarget()
          )}
        >
          Növbəti
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
  
  // Mobile menu sheet
  const MobileMenuSheet = () => (
    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Məlumat Girişi</SheetTitle>
          <SheetDescription>
            Formanın tamamlanma statusu və naviqasiya
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Progress overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ümumi Proqres</span>
              <span className="text-sm text-muted-foreground">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
          
          {/* Auto-save status */}
          <AutoSaveIndicator
            isSaving={autoSave.isSaving}
            autoSaveEnabled={autoSave.autoSaveEnabled}
            lastSaveTime={autoSave.lastSaveTime}
            saveError={autoSave.saveError}
            saveAttempts={autoSave.saveAttempts}
            hasUnsavedChanges={autoSave.hasUnsavedChanges}
            onManualSave={() => autoSave.saveNow()}
            onRetry={() => autoSave.saveNow()}
            onResetError={autoSave.resetError}
            className="text-xs"
          />
          
          {/* Step overview */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Addımlar</span>
            <div className="space-y-2">
              {steps.map((stepColumns, index) => {
                const stepErrors = stepColumns.filter(col => 
                  validation.getFieldError(col.id)
                ).length;
                const stepCompleted = stepColumns.filter(col => {
                  const value = formData[col.id];
                  return value && String(value).trim() !== '';
                }).length;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      index === currentStep ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => {
                      setCurrentStep(index);
                      setShowMobileMenu(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        index === currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Addım {index + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {stepColumns.length} sahə
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {stepErrors > 0 ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : stepCompleted === stepColumns.length ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {stepCompleted}/{stepColumns.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  // Desktop layout
  if (!isMobile && !isTablet) {
    return (
      <div className={cn("space-y-6", className)}>
        <AutoSaveIndicator
          isSaving={autoSave.isSaving}
          autoSaveEnabled={autoSave.autoSaveEnabled}
          lastSaveTime={autoSave.lastSaveTime}
          saveError={autoSave.saveError}
          saveAttempts={autoSave.saveAttempts}
          hasUnsavedChanges={autoSave.hasUnsavedChanges}
          onManualSave={() => autoSave.saveNow()}
          onRetry={() => autoSave.saveNow()}
          onResetError={autoSave.resetError}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Məlumat Girişi</CardTitle>
            <div className="flex items-center gap-4">
              <Progress value={totalProgress} className="flex-1" />
              <span className="text-sm text-muted-foreground">{totalProgress}%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {columns.map((column) => (
              <EnhancedFormField
                key={column.id}
                id={column.id}
                name={column.name}
                column={column}
                value={formData[column.id]}
                onChange={(value) => handleFieldChange(column.id, value)}
                onBlur={() => validation.markFieldAsTouched(column.id)}
                error={validation.getFieldError(column.id)}
                warning={validation.getFieldWarning(column.id)}
                isValidating={validation.isFieldValidating(column.id)}
                readOnly={readOnly}
              />
            ))}
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!validation.isValid || isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Mobile/Tablet layout
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <MobileHeader />
      
      <div 
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Step progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Addım {currentStep + 1} / {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stepProgress}% tamamlandı
                </span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
            
            {/* Current step fields */}
            <div className="space-y-6">
              {currentStepColumns.map((column) => (
                <EnhancedFormField
                  key={column.id}
                  id={column.id}
                  name={column.name}
                  column={column}
                  value={formData[column.id]}
                  onChange={(value) => handleFieldChange(column.id, value)}
                  onBlur={() => validation.markFieldAsTouched(column.id)}
                  error={validation.getFieldError(column.id)}
                  warning={validation.getFieldWarning(column.id)}
                  isValidating={validation.isFieldValidating(column.id)}
                  readOnly={readOnly}
                  className={isTouchDevice ? "text-base" : ""} // Larger text on mobile
                />
              ))}
            </div>
            
            {/* Bottom spacing for navigation */}
            <div className="h-20" />
          </div>
        </ScrollArea>
      </div>
      
      <StepNavigation />
      <MobileMenuSheet />
    </div>
  );
};

export default MobileOptimizedDataEntry;

/**
 * Bu komponent artıq aşağıdakı funksiyaları dəstəkləyir:
 * 
 * ✅ Touch-optimized interface
 * ✅ Swipe navigation between steps
 * ✅ Mobile-first responsive design
 * ✅ Progressive step-by-step form filling
 * ✅ Touch-friendly button sizes
 * ✅ Performance optimizations
 * ✅ Accessibility support
 * ✅ Real-time validation
 * ✅ Auto-save functionality
 * ✅ Mobile menu with overview
 * ✅ Progress tracking
 */