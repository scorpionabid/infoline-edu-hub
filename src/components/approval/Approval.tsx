
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguageSafe } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PendingApprovalItem } from '@/types/dashboard';
import PendingApprovalsTable from './PendingApprovalsTable';
import DataEntryTable from '@/components/dataEntry/DataEntryTable';
import { DataEntryTableData } from '@/types/dataEntry';
import { useToast } from '@/components/ui/use-toast';

const Approval: React.FC = () => {
  const { t } = useLanguageSafe();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canApproveData, currentRole } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Təsdiq gözləyən məlumatları əldə edirk
  const {
    data: pendingItems = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['approvals', activeTab],
    queryFn: async () => {
      // Əvvəlcə məktəblərə aid kateqoriyalar üzrə təsdiq gözləyən məlumatları qruplaşdırırıq
      const { data, error } = await supabase.rpc('get_pending_approvals_grouped', {
        p_status: activeTab
      });

      if (error) throw new Error(error.message);
      
      return data || [];
    },
    enabled: canApproveData
  });

  // Yüklənmə zamanı istifadəçinin təsdiq səlahiyyətləri olub-olmadığını yoxlayırıq
  useEffect(() => {
    if (!canApproveData) {
      toast({
        title: t('noPermission'),
        description: t('noApprovalPermissionDescription'),
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [canApproveData, navigate, toast, t]);

  // Axtarış funksiyası
  const filteredItems = pendingItems.filter(item => 
    item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('approvals')}</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          {t('refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{t('dataApprovals')}</CardTitle>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchBySchoolOrCategory')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
              <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
              <TabsTrigger value="rejected">{t('rejected')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {isLoading ? (
                <div className="text-center p-6">{t('loading')}</div>
              ) : isError ? (
                <div className="text-center p-6 text-red-600">{t('errorLoadingData')}</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground flex flex-col items-center">
                  <Info className="h-8 w-8 mb-2" />
                  <p>{searchTerm ? t('noResultsFound') : t('noPendingApprovals')}</p>
                </div>
              ) : (
                <PendingApprovalsTable items={filteredItems} onRefresh={refetch} />
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {isLoading ? (
                <div className="text-center p-6">{t('loading')}</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground flex flex-col items-center">
                  <Info className="h-8 w-8 mb-2" />
                  <p>{searchTerm ? t('noResultsFound') : t('noApprovedData')}</p>
                </div>
              ) : (
                <PendingApprovalsTable items={filteredItems} onRefresh={refetch} />
              )}
            </TabsContent>
            
            <TabsContent value="rejected">
              {isLoading ? (
                <div className="text-center p-6">{t('loading')}</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground flex flex-col items-center">
                  <Info className="h-8 w-8 mb-2" />
                  <p>{searchTerm ? t('noResultsFound') : t('noRejectedData')}</p>
                </div>
              ) : (
                <PendingApprovalsTable items={filteredItems} onRefresh={refetch} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approval;
