
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon?: number;
  overdue?: number;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  pending,
  approved,
  rejected,
  draft,
  dueSoon = 0,
  overdue = 0
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'rejected':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'dueSoon':
        return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'overdue':
        return 'text-pink-600 bg-pink-100 border-pink-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('approved'))}>
        <span className="text-xs font-medium">Təsdiqlənmiş</span>
        <span className="text-lg font-bold">{approved}</span>
      </div>
      <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('pending'))}>
        <span className="text-xs font-medium">Gözləmədə</span>
        <span className="text-lg font-bold">{pending}</span>
      </div>
      <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('rejected'))}>
        <span className="text-xs font-medium">Rədd edilmiş</span>
        <span className="text-lg font-bold">{rejected}</span>
      </div>
      <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('draft'))}>
        <span className="text-xs font-medium">Qaralama</span>
        <span className="text-lg font-bold">{draft}</span>
      </div>
      {(dueSoon > 0 || overdue > 0) && (
        <>
          <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('dueSoon'))}>
            <span className="text-xs font-medium">Tezliklə bitən</span>
            <span className="text-lg font-bold">{dueSoon}</span>
          </div>
          <div className={cn('flex flex-col p-3 rounded-md border', getStatusColor('overdue'))}>
            <span className="text-xs font-medium">Vaxtı keçmiş</span>
            <span className="text-lg font-bold">{overdue}</span>
          </div>
        </>
      )}
    </div>
  );
};
