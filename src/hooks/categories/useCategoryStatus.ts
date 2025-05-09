
import { useState, useEffect } from 'react';
import { CategoryStatus } from '@/types/category';

export const useCategoryStatus = (status: CategoryStatus) => {
  const [statusInfo, setStatusInfo] = useState({
    color: '',
    text: '',
  });

  useEffect(() => {
    if (status === 'pending') {
      setStatusInfo({
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pending'
      });
    } else if (status === 'active') {
      setStatusInfo({
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Active'
      });
    } else if (status === 'completed') {
      setStatusInfo({
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Completed'
      });
    } else if (status === 'inactive') {
      setStatusInfo({
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Inactive'
      });
    } else if (status === 'draft') {
      setStatusInfo({
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Draft'
      });
    } else if (status === 'approved') {
      setStatusInfo({
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved'
      });
    } else if (status === 'archived') {
      setStatusInfo({
        color: 'bg-gray-100 text-gray-500 border-gray-200',
        text: 'Archived'
      });
    } else {
      setStatusInfo({
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: status
      });
    }
  }, [status]);

  return statusInfo;
};
