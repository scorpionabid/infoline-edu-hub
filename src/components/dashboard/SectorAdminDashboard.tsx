import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSectorAdminDashboard } from '@/hooks/useSectorAdminDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, School, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EnhancedApprovalDialog from '../approval/EnhancedApprovalDialog';
import { SchoolsTable } from './sector-admin/SchoolsTable'; // İmportu düzələk

interface SectorAdminDashboardData {
  // Add properties of SectorAdminDashboardData type here
}

export const SectorAdminDashboard: React.FC<{ data: SectorAdminDashboardData }> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedApproval, setSelectedApproval] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [entryDetails, setEntryDetails] = React.useState<any>(null);
  const [isEntryDetailsLoading, setIsEntryDetailsLoading] = React.useState(false);

  const {
    schools,
    pendingApprovals,
    totalSchools,
    completedSchools,
    pendingSchools,
    notStartedSchools,
    isLoading,
    error,
    refreshData,
    approveEntries,
    rejectEntries,
    viewEntryDetails,
  } = useSectorAdminDashboard();

  const handleViewDetails = async (approval: any) => {
    setSelectedApproval(approval);
    setIsEntryDetailsLoading(true);

    try {
      const result = await viewEntryDetails(approval.schoolId, approval.categoryId);
      if (result.success) {
        setEntryDetails(result.data);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error('Məlumat detalları alınarkən xəta:', error);
    } finally {
      setIsEntryDetailsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('error')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
          <Button onClick={refreshData} className="mt-4">
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSchools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {t('schoolsInSector')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('completedSchools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSchools}</div>
            <Progress value={(completedSchools / totalSchools) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingSchools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingSchools}</div>
            <Progress value={(pendingSchools / totalSchools) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('notStartedSchools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{notStartedSchools}</div>
            <Progress value={(notStartedSchools / totalSchools) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            {t('pendingApprovals')} 
            {pendingApprovals.length > 0 && <Badge variant="secondary" className="ml-2">{pendingApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center">
            <School className="mr-2 h-4 w-4" />
            {t('schools')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>{t('pendingApprovals')}</CardTitle>
              <CardDescription>
                {t('pendingApprovalsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-2 text-green-500" />
                  <p>{t('noApprovals')}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('school')}</TableHead>
                        <TableHead>{t('category')}</TableHead>
                        <TableHead>{t('submittedAt')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">{approval.schoolName}</TableCell>
                          <TableCell>{approval.categoryName}</TableCell>
                          <TableCell>{new Date(approval.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" />
                              {t('pending')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewDetails(approval)}
                              disabled={isEntryDetailsLoading}
                            >
                              {isEntryDetailsLoading && selectedApproval?.id === approval.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              {t('viewDetails')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools">
          <Card>
            <CardHeader>
              <CardTitle>{t('schools')}</CardTitle>
              <CardDescription>
                {t('schoolsInSectorDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <SchoolsTable schools={sectorSchools.map(school => ({
                  ...school,
                  formsCompleted: 0, // Standart dəyər
                  totalForms: 0      // Standart dəyər
                }))} />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedApproval && entryDetails && (
        <EnhancedApprovalDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          schoolName={selectedApproval.schoolName}
          categoryName={selectedApproval.categoryName}
          data={entryDetails.entries || []}
          isProcessing={isEntryDetailsLoading}
          currentStatus={selectedApproval.status}
          onApprove={async () => {
            const result = await approveEntries(
              selectedApproval.schoolId,
              selectedApproval.categoryId,
              [selectedApproval.id]
            );
            if (result.success) {
              setIsDetailsOpen(false);
              setSelectedApproval(null);
              refreshData();
            }
          }}
          onReject={async (reason) => {
            const result = await rejectEntries(
              selectedApproval.schoolId,
              selectedApproval.categoryId,
              [selectedApproval.id],
              reason
            );
            if (result.success) {
              setIsDetailsOpen(false);
              setSelectedApproval(null);
              refreshData();
            }
          }}
        />
      )}
    </>
  );
};
