
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Save, Send, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDataEntry } from '@/hooks/useDataEntry';
import FormField from './components/FormField';

interface DataEntryFormProps {
  initialCategoryId?: string | null;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ initialCategoryId }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
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

  // Əmin olaq ki, categories mövcuddur
  const currentCategory = categories.length > 0 ? categories[currentCategoryIndex] : null;
  const currentEntryData = currentCategory ? formData.entries.find(entry => entry.categoryId === currentCategory.id) : null;
  
  // Yükləmə zamanı loader göstərmək
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Melumat formasi ve kategoriyalar
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
            <CardTitle className="text-xl">{t('dataForm')}</CardTitle>
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
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
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
                
                <Form>
                  <form className="space-y-4">
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
                  </form>
                </Form>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Aşağıda düymələrin olduğu sabit panel */}
          <div className="sticky bottom-0 flex justify-end pt-6 mt-8 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={saveForm}
                disabled={isAutoSaving || isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('saveAsDraft')}
              </Button>
              <Button 
                onClick={() => submitForApproval()}
                disabled={isSubmitting || errors.length > 0}
              >
                <Send className="h-4 w-4 mr-2" />
                {formData.status === 'submitted' ? t('resubmit') : t('submitForApproval')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntryForm;
