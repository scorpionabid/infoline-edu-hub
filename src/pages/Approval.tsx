
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { useApprovalData } from '@/hooks/approval/useApprovalData';
import { DataEntryRecord } from '@/types/dataEntry';

const Approval: React.FC = () => {
  const { data, loading, error } = useApprovalData();
  
  // Hook özü data-nı load edir, useEffect-ə ehtiyac yoxdur

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Approval Queue" description="Review and approve pending data entries" />
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        {loading ? (
          <Card>
            <CardContent className="p-6">Loading approval data...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-red-500">
              Error loading approval data: {error.message}
            </CardContent>
          </Card>
        ) : !data || data.schools.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center">No pending approvals found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Təsdiqləmə məlumatları</h3>
                  <p className="text-sm text-gray-500">
                    Məktəblər: {data?.schools.length} | Regionlar: {data?.regions.length} | Sektorlar: {data?.sectors.length}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <p>Təsdiqləmə məlumatları yükləndi, amma indilik tam funksionallıq tətbiq edilməyib.</p>
                  <p>Refaktor prosesində bu səhifə yenilənəcək.</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Approval;
