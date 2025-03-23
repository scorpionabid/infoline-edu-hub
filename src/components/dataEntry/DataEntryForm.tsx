
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, Send, AlertTriangle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDataEntry } from '@/hooks/useDataEntry';
import FormField from './components/FormField';
import DataEntryDialogs from './DataEntryDialogs';
import StatusIndicators from './StatusIndicators';

interface DataEntryFormProps {
  initialCategoryId?: string | null;
  onDataChanged?: () => void; // Data dəyişikliklərini izləmək üçün callback
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ initialCategoryId, onDataChanged }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  
  const {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData,
    errors
  } = useDataEntry(initialCategoryId);

  // Data dəyişikliklərini izlə
  useEffect(() => {
    if (onDataChanged) {
      onDataChanged();
    }
  }, [formData, onDataChanged]);

  // Əmin olaq ki, categories mövcuddur
  const currentCategory = categories.length > 0 ? categories[currentCategoryIndex] : null;
  const currentEntryData = currentCategory ? formData.entries.find(entry => entry.categoryId === currentCategory.id) : null;
  
  // Təsdiq sorğusu
  const handleSubmitClick = () => {
    if (errors.length > 0) {
      toast({
        title: t('pleaseCorrectErrors'),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  // Təsdiq prosesini tamamla
  const handleSubmitConfirm = () => {
    setIsSubmitDialogOpen(false);
    submitForApproval();
    // Son dəfə işlənən kateqoriyanı qeyd et (gələcək ziyarətlər üçün)
    if (currentCategory) {
      localStorage.setItem('lastEditedCategory', currentCategory.id);
    }
  };
  
  // Yükləmə zamanı loader göstərmək
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Əgər heç bir kateqoriya yoxdursa
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">{t('noCategoriesFound')}</h3>
        <p className="text-muted-foreground">{t('noCategoriesFoundDesc')}</p>
      </div>
    );
  }
  
  // Tabları kateqoriyalar əsasında formalaşdır
  const tabs = [
    { id: 'general', label: t('generalInfo') },
    { id: 'student', label: t('studentInfo') },
    { id: 'teacher', label: t('teacherInfo') },
    { id: 'resources', label: t('resources') }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex items-center">
              <CardTitle className="text-xl">{currentCategory?.name || t('dataForm')}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2" 
                onClick={() => setIsHelpDialogOpen(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            {currentCategory?.deadline && (
              <div className="flex items-center text-amber-600 text-sm">
                <AlertTriangle size={16} className="mr-1" />
                <span className="font-medium">{t('deadline')}:</span>
                <span className="font-bold ml-1">
                  {new Date(currentCategory.deadline).toLocaleDateString('az-AZ', {day: 'numeric', month: 'long', year: 'numeric'})}
                </span>
                <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  ({Math.ceil((new Date(currentCategory.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} {t('daysLeft')})
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Kateqoriya seçici */}
          {categories.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">{t('selectCategory')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category, index) => {
                  const entry = formData.entries.find(e => e.categoryId === category.id);
                  const isComplete = entry?.isCompleted || false;
                  const isCurrentCategory = index === currentCategoryIndex;
                  
                  return (
                    <Button
                      key={category.id}
                      variant={isCurrentCategory ? "default" : "outline"}
                      className={cn(
                        "justify-start h-auto py-2 px-3",
                        isComplete && !isCurrentCategory && "border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
                        category.deadline && new Date(category.deadline) < new Date() && !isCurrentCategory && "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                      )}
                      onClick={() => changeCategory(index)}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-xs opacity-80 truncate max-w-[150px]">
                            {entry?.completionPercentage ? `${Math.round(entry.completionPercentage)}% ${t('complete')}` : t('notStarted')}
                          </span>
                        </div>
                        
                        {entry?.approvalStatus && (
                          <StatusBadge status={entry.approvalStatus === 'approved' ? 'approved' : entry.approvalStatus === 'rejected' ? 'rejected' : 'pending'} />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Status indikatorları */}
          <StatusIndicators 
            errors={errors.filter(e => e.categoryId === currentCategory?.id)} 
            status={formData.status}
            showMessages
          />
          
          {/* Form kontentləri */}
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="relative py-2 data-[state=active]:bg-primary/10"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="pt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{tab.label}</h3>
                  <p className="text-muted-foreground text-sm">
                    {tab.id === 'general' 
                      ? t('schoolBasicInfoDesc') 
                      : tab.id === 'student' 
                      ? t('studentInfoDesc')
                      : tab.id === 'teacher'
                      ? t('teacherInfoDesc')
                      : t('resourcesInfoDesc')
                    }
                  </p>
                </div>
                
                {errors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      {t('fillAllRequiredFields')}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tab.id === 'general' && (
                      <>
                        <FormField
                          label={t('schoolName')}
                          isRequired={true}
                          error={getErrorForColumn('schoolName')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={t('enterSchoolName')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'schoolName', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'schoolName')?.value as string) || ''}
                          />
                          <p className="text-xs text-muted-foreground mt-1">{t('enterFullSchoolName')}</p>
                        </FormField>
                        
                        <FormField
                          label={t('schoolType')}
                          isRequired={true}
                          error={getErrorForColumn('schoolType')}
                        >
                          <select 
                            className="w-full px-3 py-2 border rounded-md"
                            onChange={(e) => updateValue(currentCategory?.id || '', 'schoolType', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'schoolType')?.value as string) || ''}
                          >
                            <option value="">{t('select')}</option>
                            <option value="primary">{t('primarySchool')}</option>
                            <option value="secondary">{t('secondarySchool')}</option>
                            <option value="high">{t('highSchool')}</option>
                          </select>
                        </FormField>
                        
                        <FormField
                          label={t('address')}
                          isRequired={true}
                          error={getErrorForColumn('address')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={t('enterAddress')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'address', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'address')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('phoneNumber')}
                          isRequired={true}
                          error={getErrorForColumn('phoneNumber')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={t('enterPhoneNumber')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'phoneNumber', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'phoneNumber')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('email')}
                          isRequired={true}
                          error={getErrorForColumn('email')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="email"
                            placeholder={t('enterEmail')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'email', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'email')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('website')}
                          isRequired={false}
                          error={getErrorForColumn('website')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={t('enterWebsite')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'website', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'website')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('teachingLanguage')}
                          isRequired={true}
                          error={getErrorForColumn('teachingLanguage')}
                        >
                          <select 
                            className="w-full px-3 py-2 border rounded-md"
                            onChange={(e) => updateValue(currentCategory?.id || '', 'teachingLanguage', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'teachingLanguage')?.value as string) || ''}
                          >
                            <option value="">{t('select')}</option>
                            <option value="az">{t('azerbaijani')}</option>
                            <option value="ru">{t('russian')}</option>
                            <option value="en">{t('english')}</option>
                            <option value="mixed">{t('mixed')}</option>
                          </select>
                        </FormField>
                        
                        <FormField
                          label={t('foundingYear')}
                          isRequired={false}
                          error={getErrorForColumn('foundingYear')}
                          className="md:col-span-2"
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterFoundingYear')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'foundingYear', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'foundingYear')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('notes')}
                          isRequired={false}
                          error={getErrorForColumn('notes')}
                          className="md:col-span-2"
                        >
                          <textarea 
                            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                            placeholder={t('enterNotes')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'notes', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'notes')?.value as string) || ''}
                          />
                        </FormField>
                      </>
                    )}
                    
                    {tab.id === 'student' && (
                      <>
                        {/* Burada tələbə məlumatlarını göstərəcək sahələr olacaq */}
                        <FormField
                          label={t('totalStudents')}
                          isRequired={true}
                          error={getErrorForColumn('totalStudents')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterTotalStudents')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'totalStudents', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'totalStudents')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('maleStudents')}
                          isRequired={true}
                          error={getErrorForColumn('maleStudents')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterMaleStudents')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'maleStudents', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'maleStudents')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('femaleStudents')}
                          isRequired={true}
                          error={getErrorForColumn('femaleStudents')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterFemaleStudents')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'femaleStudents', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'femaleStudents')?.value as string) || ''}
                          />
                        </FormField>
                      </>
                    )}
                    
                    {tab.id === 'teacher' && (
                      <>
                        {/* Burada müəllim məlumatlarını göstərəcək sahələr olacaq */}
                        <FormField
                          label={t('totalTeachers')}
                          isRequired={true}
                          error={getErrorForColumn('totalTeachers')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterTotalTeachers')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'totalTeachers', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'totalTeachers')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('permanentTeachers')}
                          isRequired={false}
                          error={getErrorForColumn('permanentTeachers')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterPermanentTeachers')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'permanentTeachers', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'permanentTeachers')?.value as string) || ''}
                          />
                        </FormField>
                      </>
                    )}
                    
                    {tab.id === 'resources' && (
                      <>
                        {/* Burada resurslar məlumatlarını göstərəcək sahələr olacaq */}
                        <FormField
                          label={t('classrooms')}
                          isRequired={true}
                          error={getErrorForColumn('classrooms')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterClassrooms')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'classrooms', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'classrooms')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('libraries')}
                          isRequired={false}
                          error={getErrorForColumn('libraries')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterLibraries')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'libraries', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'libraries')?.value as string) || ''}
                          />
                        </FormField>
                        
                        <FormField
                          label={t('computersForStudents')}
                          isRequired={false}
                          error={getErrorForColumn('computersForStudents')}
                        >
                          <input 
                            className="w-full px-3 py-2 border rounded-md"
                            type="number"
                            placeholder={t('enterComputersForStudents')}
                            onChange={(e) => updateValue(currentCategory?.id || '', 'computersForStudents', e.target.value)}
                            value={(currentEntryData?.values.find(v => v.columnId === 'computersForStudents')?.value as string) || ''}
                          />
                        </FormField>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Aşağıda düymələrin olduğu sabit panel */}
          <div className="sticky bottom-0 flex justify-end pt-6 mt-8 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  saveForm();
                  // Son dəfə işlənən kateqoriyanı qeyd et (gələcək ziyarətlər üçün)
                  if (currentCategory) {
                    localStorage.setItem('lastEditedCategory', currentCategory.id);
                  }
                }}
                disabled={isAutoSaving || isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isAutoSaving ? (
                  <span className="flex items-center">
                    <span className="w-3 h-3 mr-2 rounded-full animate-pulse bg-primary/60"></span>
                    {t('saving')}...
                  </span>
                ) : t('saveAsDraft')}
              </Button>
              <Button 
                onClick={handleSubmitClick}
                disabled={isSubmitting || errors.length > 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {formData.status === 'submitted' ? t('resubmit') : t('submitForApproval')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog komponentləri */}
      <DataEntryDialogs
        isSubmitDialogOpen={isSubmitDialogOpen}
        setIsSubmitDialogOpen={setIsSubmitDialogOpen}
        isHelpDialogOpen={isHelpDialogOpen}
        setIsHelpDialogOpen={setIsHelpDialogOpen}
        submitForApproval={handleSubmitConfirm}
      />
    </div>
  );
};

// Helper üçün import əlavə etmək lazımdır
import StatusBadge from './components/StatusBadge';
import { cn } from "@/lib/utils";

export default DataEntryForm;
