import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataEntryContainer } from '@/components/dataEntry/DataEntryContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Building, School } from 'lucide-react';

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
import { DirectSectorDataEntry } from '@/components/dataEntry/sector/DirectSectorDataEntry';

/**
 * Yenilenmis Sektor Melumat Daxil Etme Sehifesi
 * 
 * Bu sehife yeni UX pattern-ini tetbiq edir:
 * 1. Mode Selection (tek/bulk)
 * 2. Context Setup (kateqoriya/sutun)
 * 3. Target Selection (mekteb secimi)
 * 4. Data Input (melumat daxil etme)
 */
const SectorDataEntryPage: React.FunctionComponent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const [userSectorId, setUserSectorId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  
  // Workflow state management
  const workflow = useDataEntryWorkflow();
  
  // Get user's sector ID and role
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('sector_id, role')
          .eq('user_id', user.id)
          .eq('role', 'sectoradmin')
          .single();
          
        if (data?.sector_id) {
          setUserSectorId(data.sector_id);
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
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

  // Validation logic - sector mode üçün yenilendi
  const canProceed = (() => {
    switch (workflow.step) {
      case 'mode':
        // Mode və entryType seçilməlidir
        return workflow.mode !== null && workflow.entryType !== null;
      case 'context':
        return workflow.canProceed.target;
      case 'target':
        // Target step yalnız school mode üçün lazimdir
        return workflow.entryType === 'sector' ? true : workflow.canProceed.input;
      case 'input':
        // Input step-də bulk mode və sector mode üçün hər zaman true
        return workflow.entryType === 'sector' || workflow.mode === 'bulk' || workflow.inputValue.trim().length > 0;
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
        entryType={workflow.entryType}
        className="mb-8"
      />

      {/* Step Content */}
      <div className="flex-1 mb-6">
        {workflow.step === 'mode' && (
          <div className="space-y-6">
            <EntryModeSelector
              selectedMode={workflow.mode}
              onModeSelect={handleModeSelect}
            />
            
            {/* Entry Type Selector */}
            {workflow.mode && (
              <Card>
                <CardHeader>
                  <CardTitle>Məlumat Tipi Seçimi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={workflow.entryType === 'school' ? 'default' : 'outline'}
                      onClick={() => workflow.setEntryType('school')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <School className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Məktəb Məlumatları</div>
                        <div className="text-sm text-muted-foreground">
                          Məktəblər üçün proxy data entry
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={workflow.entryType === 'sector' ? 'default' : 'outline'}
                      onClick={() => workflow.setEntryType('sector')}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                    >
                      <Building className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-medium">Sektor Məlumatları</div>
                        <div className="text-sm text-muted-foreground">
                          Sektor üçün birbaşa məlumat
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {workflow.step === 'context' && (
          <DataEntryContext
            selectedCategory={workflow.selectedCategory}
            selectedColumn={workflow.selectedColumn}
            onCategoryChange={handleCategoryChange}
            onColumnChange={handleColumnChange}
            mode={workflow.mode!}
            userRole={userRole}
            entryType={workflow.entryType}
          />
        )}

        {workflow.step === 'target' && workflow.entryType === 'school' && (
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

        {workflow.step === 'input' && (workflow.entryType === 'school' ? workflow.selectedSchools.length > 0 : true) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {workflow.entryType === 'sector' ? 'Sektor Məlumat Daxil Etmə' : 'Məlumat Daxil Etmə'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.entryType === 'sector' ? (
                <DirectSectorDataEntry
                  sectorId={userSectorId}
                  categoryId={workflow.selectedCategory!}
                  columnId={workflow.selectedColumn!}
                  onClose={handleCancel}
                  onComplete={handleComplete}
                />
              ) : workflow.mode === 'single' ? (
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
                    <h4 className="font-medium mb-2">Bulk Məlumat Daxil Etmə</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>{workflow.selectedSchools.length}</strong> məktəb üçün{' '}
                      <strong>{workflow.selectedColumn}</strong> sütununa məlumat daxil edin
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

      {/* Navigation */}
      {!(workflow.step === 'input' && (workflow.mode === 'bulk' || workflow.entryType === 'sector')) && (
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