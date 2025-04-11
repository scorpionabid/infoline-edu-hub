
import React from 'react';
import { StatsCard } from './StatsCard';
import { useLanguage } from '@/context/LanguageContext';

interface StatsRowProps {
  stats: {
    regions?: number;
    sectors?: number;
    schools?: number;
    users?: number;
    pendingApprovals?: number;
    completionRate?: number;
  };
}

const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.regions !== undefined && (
        <StatsCard 
          title={t('regions')}
          value={stats.regions.toString()}
          icon="region"
          description={t('activeRegions')}
        />
      )}
      
      {stats.sectors !== undefined && (
        <StatsCard 
          title={t('sectors')}
          value={stats.sectors.toString()}
          icon="sector"
          description={t('activeSectors')}
        />
      )}
      
      {stats.schools !== undefined && (
        <StatsCard 
          title={t('schools')}
          value={stats.schools.toString()}
          icon="school"
          description={t('activeSchools')}
        />
      )}
      
      {stats.users !== undefined && (
        <StatsCard 
          title={t('users')}
          value={stats.users.toString()}
          icon="user"
          description={t('activeUsers')}
        />
      )}
      
      {stats.pendingApprovals !== undefined && (
        <StatsCard 
          title={t('pendingApprovals')}
          value={stats.pendingApprovals.toString()}
          icon="approval"
          description={t('pendingApprovalsDesc')}
        />
      )}
      
      {stats.completionRate !== undefined && (
        <StatsCard 
          title={t('completionRate')}
          value={`${stats.completionRate}%`}
          icon="completion"
          description={t('completionRateDesc')}
        />
      )}
    </div>
  );
};

export default StatsRow;
