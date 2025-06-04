
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { useDataEntryState } from '@/hooks/business/dataEntry/useDataEntryState';
import DataEntryFormContent from './DataEntryFormContent';
import { useCategoryQuery } from '@/hooks/api/categories/useCategoryQuery';
import { Loader2, AlertCircle } from 'lucide-react';

interface DataEntryFormProps {
  categoryId: string;
  schoolId: string;
  onSubmit?: (data: any) => void;
  readOnly?: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  categoryId,
  schoolId,
  onSubmit,
  readOnly = false
}) => {
  // Category data
  const { category, isLoading: categoryLoading, isError: categoryError } = useCategoryQuery({
    categoryId,
    enabled: !!categoryId
  });

  // Data entry state
  const {
    entries,
    isLoading: entriesLoading,
    isError: entriesError,
    updateEntryValue
  } = useDataEntryState({
    categoryId,
    schoolId,
    enabled: !!categoryId && !!schoolId
  });

  // Form setup
  const form = useForm({
    defaultValues: {}
  });

  const isLoading = categoryLoading || entriesLoading;
  const hasError = categoryError || entriesError;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Məlumatlar yüklənir...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError || !category) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>Kateqoriya məlumatları yüklənə bilmədi</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        {category.description && (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <DataEntryFormContent
              category={category}
              readOnly={readOnly}
            />
            
            {!readOnly && (
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit">
                  Yadda saxla
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DataEntryForm;
