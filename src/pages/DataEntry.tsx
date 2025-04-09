import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FormStatus } from '@/types/form';
import { Plus, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import FormStatusSection from '@/components/dashboard/school-admin/FormStatusSection';

// FormStatusSection komponentini yenidən istifadə etmək üçün adapter komponenti yaradırıq
const FormStatusAdapter = ({ forms, navigateToDataEntry, activeStatus, compact }: any) => {
  return (
    <FormStatusSection 
      dueSoonCount={forms.dueSoon || 0}
      overdueCount={forms.overdue || 0}
      totalCount={forms.total || 0}
    />
  );
};

// Dummy data for demonstration
const getDummyFormStatus = () => ({
  pending: 5,
  approved: 12,
  rejected: 2,
  dueSoon: 3,
  overdue: 1,
  total: 23
});

const getDummyForms = (status: FormStatus) => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `form-${i}`,
    title: `Form ${i + 1}`,
    category: `Category ${(i % 3) + 1}`,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    status: status,
    progress: Math.floor(Math.random() * 100)
  }));
};

// Əsas DataEntry komponentində FormStatusAdapter-dən istifadə edək
const DataEntry = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [formStatus, setFormStatus] = useState(getDummyFormStatus());
  const [activeStatus, setActiveStatus] = useState<FormStatus>('pending');
  const [forms, setForms] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setFormStatus(getDummyFormStatus());
      setForms(getDummyForms(activeStatus));
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [activeStatus]);
  
  useEffect(() => {
    if (formId) {
      console.log(`Opening form with ID: ${formId}`);
      // Here you would fetch the form data and open it
    }
  }, [formId]);
  
  const handleStatusChange = (status: FormStatus) => {
    setIsLoading(true);
    setActiveStatus(status);
  };
  
  const handleNavigateToStatus = (status: FormStatus) => {
    setActiveStatus(status);
  };
  
  const handleCreateForm = () => {
    navigate('/data-entry/new');
  };
  
  const handleOpenForm = (id: string) => {
    navigate(`/data-entry?formId=${id}`);
  };
  
  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'dueSoon': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <PageHeader title={t('dataEntry')} subtitle={t('dataEntryDesc')} />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('formStatus')}</CardTitle>
            <CardDescription>{t('formStatusDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <FormStatusAdapter 
                forms={formStatus}
                navigateToDataEntry={handleNavigateToStatus}
                activeStatus={activeStatus}
                compact={true}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">{t('myForms')}</h2>
          <Button onClick={handleCreateForm}>
            <Plus className="mr-2 h-4 w-4" /> {t('createNewForm')}
          </Button>
        </div>
        
        <Tabs defaultValue="pending" className="w-full" onValueChange={(value) => handleStatusChange(value as FormStatus)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('pending')}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> {t('approved')}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {t('rejected')}
            </TabsTrigger>
            <TabsTrigger value="dueSoon" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('dueSoon')}
            </TabsTrigger>
          </TabsList>
          
          {['pending', 'approved', 'rejected', 'dueSoon'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : forms.length > 0 ? (
                forms.map((form) => (
                  <Card key={form.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(form.status as FormStatus)}
                        <div>
                          <h3 className="font-medium">{form.title}</h3>
                          <p className="text-sm text-muted-foreground">{form.category} • {form.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {form.progress}% {t('completed')}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(form.id)}>
                          {t('view')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">{t('noFormsFound')}</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {t('noFormsFoundDesc')}
                    </p>
                    <Button onClick={handleCreateForm}>
                      <Plus className="mr-2 h-4 w-4" /> {t('createNewForm')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default DataEntry;
