
import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useLanguageSafe } from '@/context/LanguageContext'; 
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import FormStatusSection from '@/components/dashboard/school-admin/FormStatusSection';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDataEntries } from '@/hooks/useDataEntries';

const DataEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast: legacyToast } = useToast();
  const { t } = useLanguageSafe();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { getApprovalStatus } = useDataEntries();
  const [formStatistics, setFormStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    dueSoon: 0,
    overdue: 0
  });
  
  // Məlumatların statistikasını əldə edirik
  const fetchStats = async () => {
    try {
      // Məktəb ID-sini current istifadəçidən götürmək lazımdır
      const schoolId = 'current-school-id'; // Bu ID faktiki olaraq auth kontekstindən götürülməlidir
      const status = await getApprovalStatus(schoolId);
      
      // Burada status datasını formStatistics formatına çeviririk
      // Bu hissə real data ilə işlədilməlidir
      setFormStatistics({
        pending: status.pending || 0,
        approved: status.approved || 0,
        rejected: status.rejected || 0,
        dueSoon: 2, // Bu məlumatlar faktiki olaraq deadline-lara baxaraq hesablanmalıdır
        overdue: 1  // Bu məlumatlar faktiki olaraq deadline-lara baxaraq hesablanmalıdır
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('categoryId');
  const showAlert = queryParams.get('alert');
  const statusParam = queryParams.get('status');
  
  useEffect(() => {
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [statusParam]);
  
  useEffect(() => {
    if (showAlert === 'deadline') {
      legacyToast({
        title: t('deadlineApproaching'),
        description: t('deadlineApproachingDesc'),
        variant: "default",
      });
      
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'newcategory') {
      legacyToast({
        title: t('newCategoryAdded'),
        description: t('newCategoryAddedDesc'),
        variant: "default",
      });
      
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'rejected') {
      legacyToast({
        title: t('formRejected'),
        description: t('formRejectedDesc'),
        variant: "destructive",
      });
      
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }
  }, [legacyToast, showAlert, t, navigate, location.pathname, queryParams]);

  const handleDownloadTemplate = () => {
    // Bu məntiq DataEntryForm-a köçürülüb
    toast.success(t('excelTemplateDownloaded'), {
      description: t('excelTemplateDownloadedDesc')
    });
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
      } else {
        toast.error(t('invalidFileType'), {
          description: t('pleaseSelectExcel')
        });
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error(t('noFileSelected'));
      return;
    }

    setIsUploading(true);

    // Burada faktiki yükləmə əməliyyatı edilər
    // dataEntryForm-da uploadExcelData funksiyasını çağırmaq lazımdır
    
    setTimeout(() => {
      setIsUploading(false);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      toast.success(t('uploadSuccess'), {
        description: t('dataUploadedSuccessfully')
      });
      fetchStats(); // Statistikanı yeniləmək
    }, 2000);
  };

  const navigateToDataEntryWithStatus = (status: string | null) => {
    const newStatus = status === selectedStatus ? null : status;
    setSelectedStatus(newStatus);
    
    const newParams = new URLSearchParams(queryParams);
    if (newStatus) {
      newParams.set('status', newStatus);
    } else {
      newParams.delete('status');
    }
    
    navigate({ 
      pathname: location.pathname, 
      search: newParams.toString() 
    }, { replace: true });
  };

  const handleDataChanged = () => {
    // Məlumatlar dəyişdikdə statistikanı yeniləyirik
    fetchStats();
  };

  return (
    <>
      <Helmet>
        <title>{t('dataEntry')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack} 
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToDashboard')}
              </Button>
              <h1 className="text-3xl font-bold">{t('dataEntry')}</h1>
              <p className="text-muted-foreground mt-1">{t('schoolInfoInstructions')}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload size={16} />
                {t('uploadExcel')}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleDownloadTemplate}
              >
                <FileSpreadsheet size={16} />
                {t('excelTemplate')}
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <FormStatusSection 
              forms={formStatistics} 
              navigateToDataEntry={navigateToDataEntryWithStatus} 
              activeStatus={selectedStatus}
              compact
            />
          </div>
          
          {!categoryId && !selectedStatus && (
            <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-800">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('chooseCategory')}</AlertTitle>
              <AlertDescription>
                {t('chooseCategoryDescription')}
              </AlertDescription>
            </Alert>
          )}
          
          <DataEntryForm 
            initialCategoryId={categoryId}
            statusFilter={selectedStatus}
            onDataChanged={handleDataChanged}
          />
        </div>
        
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('uploadExcelFile')}</DialogTitle>
              <DialogDescription>
                {t('uploadExcelDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="flex flex-col items-center space-y-2 cursor-pointer">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedFile ? selectedFile.name : t('dragAndDropExcel')}</span>
                  <span className="text-xs text-muted-foreground">{t('or')}</span>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                  >
                    {t('browseFiles')}
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {!selectedFile && (
                <div className="flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('onlyExcelSupported')}</span>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={handleDownloadTemplate}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('downloadTemplate')}
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setUploadDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="button" 
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? t('uploading') : t('upload')}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
