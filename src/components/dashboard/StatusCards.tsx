
import React from 'react';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';

interface StatusCardsProps {
  completionRate: number;
  pendingApprovals: number;
}

const StatusCards: React.FC<StatusCardsProps> = ({ completionRate, pendingApprovals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CompletionRateCard completionRate={completionRate} />
      <PendingApprovalsCard pendingApprovals={pendingApprovals} />
    </div>
  );
};

export default StatusCards;
