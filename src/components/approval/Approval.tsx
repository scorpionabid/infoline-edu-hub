
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { PendingApproval } from '@/types/dashboard';
import { Loader2 } from 'lucide-react';
import { DataEntryForm } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ApprovalItem from '@/components/approval/ApprovalItem';

export const Approval = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [approvalData, setApprovalData] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedItem, setSelectedItem] = useState<DataEntryForm | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, [user]);

  const fetchPendingApprovals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Using direct query instead of RPC
      const { data, error } = await supabase
        .from('data_entries')
        .select(`
          id, 
          status,
          created_at,
          school_id,
          category_id,
          schools(name),
          categories(name)
        `)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Transform the data to match PendingApproval type
      if (data && Array.isArray(data)) {
        const approvals: PendingApproval[] = data.map(item => ({
          id: item.id,
          schoolId: item.school_id,
          schoolName: item.schools ? item.schools.name : 'Unknown School',
          categoryId: item.category_id,
          categoryName: item.categories ? item.categories.name : 'Unknown Category',
          status: item.status as 'pending' | 'approved' | 'rejected',
          createdAt: item.created_at,
          submittedAt: item.created_at,
          title: item.schools ? item.schools.name : 'Unknown School',
          count: 1
        }));
        
        setApprovalData(approvals);
      } else {
        setApprovalData([]);
      }
    } catch (err: any) {
      console.error('Error fetching approval data:', err);
      toast.error(t('errorFetchingApprovals'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(t('approvalSuccess'));
      fetchPendingApprovals();
    } catch (err: any) {
      console.error('Error approving entry:', err);
      toast.error(t('errorApprovingEntry'));
    }
  };
  
  const handleReject = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'rejected',
          rejected_by: user?.id,
          rejection_reason: reason
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(t('rejectionSuccess'));
      fetchPendingApprovals();
    } catch (err: any) {
      console.error('Error rejecting entry:', err);
      toast.error(t('errorRejectingEntry'));
    }
  };

  const filteredData = approvalData.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'approved') return item.status === 'approved';
    if (activeTab === 'rejected') return item.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">{t('approvals')}</h1>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            {t('pending')}
            {approvalData.filter(a => a.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                {approvalData.filter(a => a.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
          <TabsTrigger value="rejected">{t('rejected')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>{t('pendingApprovals')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    {t('noPendingApprovals')}
                  </p>
                ) : (
                  filteredData.map((item) => (
                    <ApprovalItem 
                      key={item.id}
                      item={item}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>{t('approvedEntries')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    {t('noApprovedEntries')}
                  </p>
                ) : (
                  filteredData.map((item) => (
                    <ApprovalItem 
                      key={item.id}
                      item={item}
                      viewOnly
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>{t('rejectedEntries')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    {t('noRejectedEntries')}
                  </p>
                ) : (
                  filteredData.map((item) => (
                    <ApprovalItem 
                      key={item.id}
                      item={item}
                      viewOnly
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Approval;
