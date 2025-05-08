
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { useApprovalData } from '@/hooks/useApprovalData';
import { DataEntryRecord } from '@/types/dataEntry';

const Approval: React.FC = () => {
  const { approvalData, loading, error, fetchApprovalData, approveEntry, rejectEntry } = useApprovalData();
  
  useEffect(() => {
    fetchApprovalData();
  }, [fetchApprovalData]);

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
        ) : approvalData.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center">No pending approvals found.</p>
            </CardContent>
          </Card>
        ) : (
          approvalData.map((item: DataEntryRecord) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {item.categories?.name || 'Undefined Category'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Column: {item.columns?.name || 'Unknown'} | 
                      Value: {item.value?.toString() || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {item.id} | Submitted: {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectEntry(item.id)}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => approveEntry(item.id)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Approval;
