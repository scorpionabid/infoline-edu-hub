
import React from 'react';
import { StatusCardsProps } from '@/types/dashboard';

const StatusCards: React.FC<StatusCardsProps> = ({ completion, status, formStats }) => {
  // Default values if not provided
  const stats = status || {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0
  };
  
  const forms = formStats || {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    total: 0
  };
  
  let completionData = {
    percentage: 0,
    total: 0,
    completed: 0
  };
  
  if (typeof completion === 'number') {
    completionData.percentage = completion;
  } else if (completion && typeof completion === 'object') {
    completionData = {
      percentage: completion.percentage || 0,
      total: completion.total || 0,
      completed: completion.completed || 0
    };
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-500">Status</h3>
        <div className="mt-2 flex justify-between items-end">
          <p className="text-3xl font-semibold">{completionData.percentage}%</p>
          <p className="text-sm text-gray-500">{completionData.completed}/{completionData.total}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
        <div className="mt-2 flex justify-between items-end">
          <p className="text-3xl font-semibold">{stats.approved}</p>
          <p className="text-sm text-gray-500">{forms.approved} forms</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <div className="mt-2 flex justify-between items-end">
          <p className="text-3xl font-semibold">{stats.pending}</p>
          <p className="text-sm text-gray-500">{forms.pending} forms</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
        <h3 className="text-sm font-medium text-gray-500">Due Soon</h3>
        <div className="mt-2 flex justify-between items-end">
          <p className="text-3xl font-semibold">{forms.dueSoon}</p>
          <p className="text-sm text-gray-500">{forms.overdue} overdue</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
