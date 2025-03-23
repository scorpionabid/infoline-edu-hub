
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormCard from './FormCard';

interface FormTabsProps {
  recentForms: Array<{
    id: string;
    title: string;
    category: string;
    status: "pending" | "approved" | "rejected" | "empty";
    completionPercentage: number;
    deadline?: string;
  }>;
  handleFormClick: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ recentForms, handleFormClick }) => {
  const { t } = useLanguage();
  
  return (
    <section>
      <Tabs defaultValue="recent">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('forms')}</h2>
          <TabsList>
            <TabsTrigger value="recent">{t('recentForms')}</TabsTrigger>
            <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
            <TabsTrigger value="urgent">{t('urgentForms')}</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="recent" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentForms.map(form => (
              <FormCard 
                key={form.id}
                id={form.id}
                title={form.title}
                category={form.category}
                status={form.status}
                completionPercentage={form.completionPercentage}
                deadline={form.deadline}
                onClick={() => handleFormClick(form.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentForms
              .filter(form => form.status === 'pending')
              .map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="urgent" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentForms
              .filter(form => {
                const isOverdue = form.deadline && new Date(form.deadline) < new Date();
                return isOverdue || form.status === 'rejected';
              })
              .map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default FormTabs;
