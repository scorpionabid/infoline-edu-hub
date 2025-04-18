import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { useDataEntry } from '@/hooks/useDataEntry';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryForm from './CategoryForm';
import CategoryConfirmationDialog from './CategoryConfirmationDialog';
import { DataEntrySaveStatus } from '@/types/dataEntry';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import FormFields from './FormFields';

const DataEntryForm: React.FC = () => {
  const { schoolId, categoryId } = useParams<{ schoolId: string; categoryId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>(categoryId || '');
  const { isSchoolAdmin } = usePermissions();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: 'save' | 'submit' }>({
    open: false,
    action: 'save'
  });

  const { 
    formData, 
    categories = [], 
    loading, 
    submitting,
    handleEntriesChange,
    handleSave,
    handleSubmitForApproval,
    loadDataForSchool,
    entries,
    submitForApproval,
    saveStatus = DataEntrySaveStatus.IDLE,
    isDataModified = false,
    error = null
  } = useDataEntry({
    schoolId,
    categoryId,
    onComplete: () => navigate('/dashboard')
  });

  // Filter categories based on assignment for school admin
  const filteredCategories = categories.filter(category => {
    if (isSchoolAdmin) {
      return category.assignment !== 'sectors';
    }
    return true;
  });

  useEffect(() => {
    if (schoolId) {
      loadDataForSchool(schoolId);
    }
  }, [schoolId, loadDataForSchool]);

  useEffect(() => {
    if (categoryId && categoryId !== activeTab) {
      setActiveTab(categoryId);
    }
  }, [categoryId, activeTab]);

  const handleTabChange = (value: string) => {
    if (isDataModified) {
      setConfirmDialog({ open: true, action: 'save' });
      return;
    }
    
    navigate(`/data-entry/${schoolId}/${value}`);
    setActiveTab(value);
  };

  const handleConfirmSave = async () => {
    await handleSave();
    setConfirmDialog({ open: false, action: 'save' });
    navigate(`/data-entry/${schoolId}/${activeTab}`);
  };

  const handleConfirmSubmit = async () => {
    await handleSubmitForApproval();
    setConfirmDialog({ open: false, action: 'submit' });
  };

  const handleSaveClick = () => {
    handleSave();
  };

  const handleSubmitClick = () => {
    setConfirmDialog({ open: true, action: 'submit' });
  };

  if (loading && (!filteredCategories || filteredCategories.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!filteredCategories || filteredCategories.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertDescription>{t('noCategoriesAvailable')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {saveStatus === DataEntrySaveStatus.SAVED && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription className="text-green-600">
            {t('dataSavedSuccessfully')}
          </AlertDescription>
        </Alert>
      )}
      
      {saveStatus === DataEntrySaveStatus.ERROR && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {t('errorSavingData')}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="h-auto p-1 overflow-x-auto max-w-screen-lg">
            {Array.isArray(filteredCategories) && filteredCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="relative py-3"
              >
                {category.name}
                {category.deadline && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {new Date(category.deadline).toLocaleDateString()}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {Array.isArray(filteredCategories) && filteredCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <CategoryForm
              category={category}
              isSaving={saveStatus === DataEntrySaveStatus.SAVING}
              isSubmitting={saveStatus === DataEntrySaveStatus.SAVING}
              isModified={isDataModified}
              onSave={handleSaveClick}
              onSubmit={handleSubmitClick}
            />
            
            <div className="border rounded-lg p-6 space-y-8">
              <FormFields
                category={category}
                entries={Array.isArray(entries) ? entries : []}
                onChange={handleEntriesChange}
                disabled={saveStatus === DataEntrySaveStatus.SAVING}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CategoryConfirmationDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.action === 'save' ? handleConfirmSave : handleConfirmSubmit}
        title={confirmDialog.action === 'save' ? t('saveChanges') : t('submitForApproval')}
        description={
          confirmDialog.action === 'save'
            ? t('saveChangesDescription')
            : t('submitForApprovalDescription')
        }
        confirmText={confirmDialog.action === 'save' ? t('save') : t('submit')}
        isLoading={saveStatus === DataEntrySaveStatus.SAVING}
      />
    </div>
  );
};

export default DataEntryForm;
