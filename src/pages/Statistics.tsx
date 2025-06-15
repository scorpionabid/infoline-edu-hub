
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import StatsGrid from '@/components/dashboard/StatsGrid';
import StatsCard from '@/components/dashboard/StatsCard';

const Statistics: React.FC = () => {
  const { t } = useLanguageSafe();

  const mockData = useMemo(() => ({
    totalSectors: 25,
    totalSchools: 150,
    completionRate: 78.5,
    pendingApprovals: 12,
    activeForms: 8,
    schoolsCompleted: 117,
    schoolsPending: 33,
    lastUpdated: new Date().toISOString()
  }), []);

  const mockRegionalData = useMemo(() => [
    { region: 'Region A', schools: 50, completionRate: 82 },
    { region: 'Region B', schools: 45, completionRate: 76 },
    { region: 'Region C', schools: 55, completionRate: 85 }
  ], []);

  const mockCategoryData = useMemo(() => [
    { category: 'Category 1', completionRate: 88 },
    { category: 'Category 2', completionRate: 92 },
    { category: 'Category 3', completionRate: 79 }
  ], []);

  return (
    <>
      <Helmet>
        <title>{t('statistics')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('statistics')}</h1>
        </div>

        <StatsGrid>
          <StatsCard
            title={t('totalSectors')}
            value={mockData.totalSectors}
            subtitle={t('activeSectors')}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title={t('totalSchools')}
            value={mockData.totalSchools}
            subtitle={t('activeSchools')}
            trend={{ value: 3, isPositive: false }}
          />
          <StatsCard
            title={t('completionRate')}
            value={`${mockData.completionRate}%`}
            subtitle={t('overallCompletionRate')}
            trend={{ value: 1.2, isPositive: true }}
          />
          <StatsCard
            title={t('pendingApprovals')}
            value={mockData.pendingApprovals}
            subtitle={t('formsAwaitingApproval')}
            trend={{ value: 2, isPositive: false }}
          />
        </StatsGrid>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-md shadow p-4">
            <h2 className="text-xl font-semibold mb-4">{t('regionalPerformance')}</h2>
            <ul>
              {mockRegionalData.map((region, index) => (
                <li key={index} className="py-2 border-b last:border-b-0">
                  {region.region}: {region.completionRate}% ({region.schools} {t('schools')})
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-md shadow p-4">
            <h2 className="text-xl font-semibold mb-4">{t('categoryCompletion')}</h2>
            <ul>
              {mockCategoryData.map((category, index) => (
                <li key={index} className="py-2 border-b last:border-b-0">
                  {category.category}: {category.completionRate}%
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-md shadow p-4">
          <h2 className="text-xl font-semibold mb-4">{t('schoolCompletionStatus')}</h2>
          <p>{t('schoolsCompleted')}: {mockData.schoolsCompleted}</p>
          <p>{t('schoolsPending')}: {mockData.schoolsPending}</p>
          <p>{t('lastUpdated')}: {mockData.lastUpdated}</p>
        </div>
      </div>
    </>
  );
};

export default Statistics;
