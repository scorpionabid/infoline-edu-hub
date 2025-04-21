
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useSectorAdminDashboard } from '@/hooks/useSectorAdminDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, School, FileText, Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportChart from '../reports/ReportChart';

const SectorAdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [entryDetails, setEntryDetails] = useState<any>(null);
  const [isEntryDetailsLoading, setIsEntryDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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

  // Dummy chart data
  const schoolCompletionData = React.useMemo(() => {
    return schools.slice(0, 5).map(school => ({
      name: school.name.length > 15 ? school.name.substring(0, 15) + '...' : school.name,
      value: school.completionRate
    }));
  }, [schools]);

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
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorFetchingEntryDetails')
      });
    } finally {
      setIsEntryDetailsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      const result = await approveEntries(
        selectedApproval.schoolId,
        selectedApproval.categoryId,
        [selectedApproval.id]
      );

      if (result.success) {
        toast({
          title: t('success'),
          description: t('dataApprovedSuccessfully')
        });
        setIsDetailsOpen(false);
        setSelectedApproval(null);
        refreshData();
      }
    } catch (error) {
      console.error('Təsdiqləmə xətası:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('approvalError')
      });
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionReason) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('rejectionReasonRequired')
      });
      return;
    }

    try {
      const result = await rejectEntries(
        selectedApproval.schoolId,
        selectedApproval.categoryId,
        [selectedApproval.id],
        rejectionReason
      );

      if (result.success) {
        toast({
          title: t('success'),
          description: t('dataRejectedSuccessfully')
        });
        setIsDetailsOpen(false);
        setSelectedApproval(null);
        setRejectionReason('');
        refreshData();
      }
    } catch (error) {
      console.error('Reddetmə xətası:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('rejectionError')
      });
    }
  };

  // Filter approvals based on search term
  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = approval.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          approval.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    // Future filtering options can be added here
    
    return matchesSearch;
  });

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
        <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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

        <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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

        <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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

        <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="md:col-span-2 bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t('schoolCompletionRates')}</CardTitle>
            <CardDescription>{t('topSchoolsCompletion')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportChart 
              data={schoolCompletionData} 
              title={t('completionBySchool')} 
              className="bg-transparent dark:bg-transparent border-0 p-0" 
            />
          </CardContent>
        </Card>

        <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>{t('pendingTasks')}</CardTitle>
            <CardDescription>{t('tasksAwaitingYourApproval')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold">
                {filteredApprovals.length}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">{t('tasksByStatus')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-muted-foreground">{t('pending')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-muted-foreground">{t('completed')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            {t('pendingApprovals')} {filteredApprovals.length > 0 && <Badge className="ml-2">{filteredApprovals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="schools">
            {t('schools')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>{t('pendingApprovals')}</CardTitle>
                  <CardDescription>
                    {t('pendingApprovalsDescription')}
                  </CardDescription>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('searchApprovals')}
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">{t('filter')}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-2" />
                  <p>{searchTerm ? t('noMatchingApprovals') : t('noApprovals')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('school')}</TableHead>
                      <TableHead>{t('category')}</TableHead>
                      <TableHead>{t('submittedAt')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>{approval.schoolName}</TableCell>
                        <TableCell>{approval.categoryName}</TableCell>
                        <TableCell>{new Date(approval.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            {t('pending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(approval)}
                            >
                              {t('viewDetails')}
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                setSelectedApproval(approval);
                                setIsDetailsOpen(true);
                              }}
                            >
                              {t('approve')}
                            </Button>
                          </div>
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
          <Card className="bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
                    <TableHead className="text-right">{t('actions')}</TableHead>
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
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            {t('completed')}
                          </Badge>
                        ) : school.completionRate > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            {t('inProgress')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
                            {t('notStarted')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
        <DialogContent className="max-w-3xl bg-background dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
                  <Input
                    type="text"
                    placeholder={t('rejectionReason')}
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
