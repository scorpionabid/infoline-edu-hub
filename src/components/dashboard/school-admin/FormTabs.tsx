import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useLanguage } from '@/context/LanguageContext';
import { FormItem } from '@/types/form';

interface FormTabsProps {
  forms: FormItem[];
}

export const FormTabs: React.FC<FormTabsProps> = ({ forms }) => {
  const { t } = useLanguage();

  const completedForms = forms.filter(form => form.status === 'completed');
  const pendingForms = forms.filter(form => form.status === 'pending');
  const rejectedForms = forms.filter(form => form.status === 'rejected');
  const draftForms = forms.filter(form => form.status === 'draft');
  const incompleteForms = forms.filter(form => form.status === 'incomplete');
  const allForms = forms;

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">{t('all')}({allForms.length})</TabsTrigger>
        <TabsTrigger value="completed">{t('completed')}({completedForms.length})</TabsTrigger>
        <TabsTrigger value="pending">{t('pending')}({pendingForms.length})</TabsTrigger>
        <TabsTrigger value="rejected">{t('rejected')}({rejectedForms.length})</TabsTrigger>
        <TabsTrigger value="draft">{t('draft')}({draftForms.length})</TabsTrigger>
        <TabsTrigger value="incomplete">{t('incomplete')}({incompleteForms.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        {allForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="completed">
        {completedForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="pending">
        {pendingForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="rejected">
        {rejectedForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="draft">
        {draftForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="incomplete">
        {incompleteForms.map((form) => (
          <div key={form.id} className="border rounded-md p-4 mb-4">
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p>Status: {form.status}</p>
            <div>
              {form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : form.submittedAt ? (
                <p className="text-xs text-muted-foreground">
                  {t('date')}: {new Date(form.submittedAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
};
