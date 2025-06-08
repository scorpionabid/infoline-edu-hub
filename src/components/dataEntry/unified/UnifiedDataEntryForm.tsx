
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Column } from '@/types/column';
import FormFields from '../core/FormFields';

export interface UnifiedDataEntryFormProps {
  category?: any;
  showActions?: boolean;
  readOnly?: boolean;
}

const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  category,
  showActions = true,
  readOnly = false
}) => {
  const columns = category?.columns || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category?.name || 'Data Entry Form'}</CardTitle>
        {category?.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <FormFields
          columns={columns}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
};

export default UnifiedDataEntryForm;
