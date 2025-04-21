import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSectorAdminDashboard } from '@/hooks/useSectorAdminDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, School, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const SectorAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedApproval, setSelectedApproval] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
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

  const handleApprove = async () => {
    if (!selectedApproval) return;

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
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason) return;

    const result = await rejectEntries(
      selectedApproval.schoolId,
      selectedApproval.categoryId,
      [selectedApproval.id],
      rejectionReason
    );

    if (result.success) {
      setIsDetailsOpen(false);
      setSelectedApproval(null);
      setRejectionReason('');
      refreshData();
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
          <TabsTrigger value="pending">
            {t('pendingApprovals')} {pendingApprovals.length > 0 && <Badge className="ml-2">{pendingApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="schools">
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
                  <CheckCircle className="mx-auto h-12 w-12 mb-2" />
                  <p>{t('noApprovals')}</p>
                </div>
              ) : (
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
                        <TableCell>{approval.schoolName}</TableCell>
                        <TableCell>{approval.categoryName}</TableCell>
                        <TableCell>{new Date(approval.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {t('pending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(approval)}>
                            {t('viewDetails')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('school')}</TableHead>
                    <TableHead>{t('address')}</TableHead>
                    <TableHead>{t('completionRate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={school.completionRate} className="h-2 w-24" />
                          <span>{school.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {school.completionRate === 100 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {t('completed')}
                          </Badge>
                        ) : school.completionRate > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {t('inProgress')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            {t('notStarted')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/schools/${school.id}`)}>
                          {t('viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {entryDetails?.category?.name} - {entryDetails?.school?.name}
            </DialogTitle>
            <DialogDescription>
              {t('approvalDetailsDescription')}
            </DialogDescription>
          </DialogHeader>

          {isEntryDetailsLoading ? (
            <div className="py-4">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('field')}</TableHead>
                    <TableHead>{t('value')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entryDetails?.entries?.map((entry: any) => (
                    <TableRow key={entry.columnId}>
                      <TableCell className="font-medium">{entry.columnName}</TableCell>
                      <TableCell>{entry.value || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          <DialogFooter className="flex space-x-2">
            <div className="flex-1">
              {selectedApproval && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={t('rejectionReason')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
                    {t('reject')}
                  </Button>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleApprove}>
              {t('approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SectorAdminDashboard;
