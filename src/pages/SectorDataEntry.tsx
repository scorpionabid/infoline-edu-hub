import React, { useState, useEffect } from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

// Import new workflow components
import { 
  EntryModeSelector, 
  ProgressIndicator, 
  DataEntryContext, 
  WorkflowNavigation, 
  useDataEntryWorkflow 
} from '@/components/dataEntry/workflow';

import { SectorAdminSchoolList } from '@/components/schools/SectorAdminSchoolList';
import SectorAdminProxyDataEntry from '@/components/dataEntry/SectorAdminProxyDataEntry';
import { BulkDataEntryDialog } from '@/components/dataEntry/BulkDataEntryDialog';

/**
 * Yenilenmis Sektor Melumat Daxil Etme Sehifesi
 * 
 * Bu sehife yeni UX pattern-ini tetbiq edir:
 * 1. Mode Selection (tek/bulk)
 * 2. Context Setup (kateqoriya/sutun)
 * 3. Target Selection (mekteb secimi)
 * 4. Data Input (melumat daxil etme)
 */
const SectorDataEntryPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const [userSectorId, setUserSectorId] = useState<string>('');
  
  // Workflow state management
  const workflow = useDataEntryWorkflow();
  
  // Get user's sector ID
  useEffect(() => {
    const fetchUserSectorId = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('sector_id')
          .eq('user_id', user.id)
          .eq('role', 'sectoradmin')
          .single();
          
        if (data?.sector_id) {
          setUserSectorId(data.sector_id);
        }
      } catch (error) {
        console.error('Error fetching user sector ID:', error);
      }
    };
    
    fetchUserSectorId();
  }, [user]);

  // Navigation handlers
  const handleNext = () => {
    const { step, canProceed } = workflow;
    
    switch (step) {
      case 'mode':
        if (canProceed.context) {
          workflow.nextStep();
        }
        break;
      case 'context':
        if (canProceed.target) {
          workflow.nextStep();
        }
        break;
      case 'target':
        if (canProceed.input) {
          workflow.nextStep();
        }
        break;
      case 'input':
        // Handle completion - bulk mode-da komponent ozu complete edecek
        if (workflow.mode === 'single') {
          handleComplete();
        }
        // Bulk mode-da BulkDataEntryDialog oz completion-i idare edir
        break;
    }
  };

  const handleBack = () => {
    workflow.previousStep();
  };

  const handleCancel = () => {
    workflow.resetWorkflow();
  };

  // Step-specific handlers
  const handleModeSelect = (mode: 'single' | 'bulk') => {
    workflow.setMode(mode);
  };

  const handleCategoryChange = (categoryId: string) => {
    workflow.setCategory(categoryId);
  };

  const handleColumnChange = (columnId: string) => {
    workflow.setColumn(columnId);
  };

  const handleSchoolSelect = (schoolId: string) => {
    if (workflow.mode === 'single') {
      workflow.setSelectedSchools([schoolId]);
    }
  };

  const handleBulkSchoolSelect = (schoolIds: string[]) => {
    workflow.setSelectedSchools(schoolIds);
  };

  const handleDataEntry = (schoolId: string) => {
    if (workflow.mode === 'single') {
      workflow.setSelectedSchools([schoolId]);
      workflow.goToStep('input');
    }
  };

  const handleComplete = () => {
    toast({
      title: "Melumat daxil etme tamamlandi",
      description: `${workflow.selectedSchools.length} mekteb ucun melumatlar ugurla daxil edildi.`,
      variant: "default",
    });
    
    // Reset workflow
    setTimeout(() => {
      workflow.resetWorkflow();
    }, 1000);
  };

  // Validation logic
  const canProceed = (() => {
    switch (workflow.step) {
      case 'mode':
        return workflow.canProceed.context;
      case 'context':
        return workflow.canProceed.target;
      case 'target':
        return workflow.canProceed.input;
      case 'input':
        // Input step-de ve bulk mode-da her zaman true qayit
        return workflow.mode === 'bulk' || workflow.inputValue.trim().length > 0;
      default:
        return false;
    }
  })();

  const canGoBack = workflow.step !== 'mode';

  return (
    <DataEntryContainer>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sektor Melumat Daxiletme</CardTitle>
            {workflow.step !== 'mode' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard-a qayit
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={workflow.step}
        completedSteps={workflow.completedSteps}
        mode={workflow.mode || 'single'}
        className="mb-8"
      />

      {/* Step Content */}
      <div className="flex-1 mb-6">
        {workflow.step === 'mode' && (
          <EntryModeSelector
            selectedMode={workflow.mode}
            onModeSelect={handleModeSelect}
          />
        )}

        {workflow.step === 'context' && (
          <DataEntryContext
            selectedCategory={workflow.selectedCategory}
            selectedColumn={workflow.selectedColumn}
            onCategoryChange={handleCategoryChange}
            onColumnChange={handleColumnChange}
            mode={workflow.mode!}
          />
        )}

        {workflow.step === 'target' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {workflow.mode === 'single' ? 'Mekteb Secimi' : 'Mektebler Secimi'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SectorAdminSchoolList
                onSchoolSelect={handleSchoolSelect}
                onDataEntry={handleDataEntry}
                onBulkSelect={handleBulkSchoolSelect}
                categoryId={workflow.selectedCategory!}
                bulkMode={workflow.mode === 'bulk'}
                workflowMode={true}
              />
            </CardContent>
          </Card>
        )}

        {workflow.step === 'input' && workflow.selectedSchools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Melumat Daxil Etme</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.mode === 'single' ? (
                <SectorAdminProxyDataEntry 
                  schoolId={workflow.selectedSchools[0]}
                  categoryId={workflow.selectedCategory!}
                  columnId={workflow.selectedColumn!}
                  onClose={handleCancel}
                  onComplete={handleComplete}
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium mb-2">Bulk Melumat Daxil Etme</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>{workflow.selectedSchools.length}</strong> mekteb ucun{' '}
                      <strong>{workflow.selectedColumn}</strong> sutununa melumat daxil edin
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Debug: categoryId={workflow.selectedCategory}, columnId={workflow.selectedColumn}
                    </div>
                  </div>
                  
                  <BulkDataEntryDialog
                    isOpen={true}
                    onClose={handleCancel}
                    selectedSchools={workflow.selectedSchools}
                    categoryId={workflow.selectedCategory!}
                    columnId={workflow.selectedColumn!}
                    onComplete={handleComplete}
                    inline={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation - Input step-de bulk mode ucun gizlet */}
      {!(workflow.step === 'input' && workflow.mode === 'bulk') && (
        <WorkflowNavigation
          currentStep={workflow.step}
          canProceed={canProceed}
          canGoBack={canGoBack}
          onNext={handleNext}
          onBack={handleBack}
          onCancel={handleCancel}
          isLoading={workflow.isLoading}
        />
      )}
    </DataEntryContainer>
  );
};

export default SectorDataEntryPage;