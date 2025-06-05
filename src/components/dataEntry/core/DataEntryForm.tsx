
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataEntryFormProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  children,
  title = 'Data Entry Form',
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default DataEntryForm;
