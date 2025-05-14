
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';

const DataEntryPage: React.FC = () => {
  const params = useParams();
  const categoryId = params.categoryId;
  
  return (
    <div className="container mx-auto p-4">
      <DataEntryForm categoryId={categoryId} />
    </div>
  );
};

export default DataEntryPage;
