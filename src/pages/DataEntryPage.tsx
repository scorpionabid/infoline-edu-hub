
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';

const DataEntryPage: React.FC = () => {
  const { categoryId } = useParams();
  
  return <DataEntryForm categoryId={categoryId} />;
};

export default DataEntryPage;
