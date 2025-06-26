
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, Upload } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/category';
import { ImportResult } from '@/types/excel';
import ExcelImportDialog from '@/components/excel/ExcelImportDialog';

export interface ExcelActionsProps {
  category?: CategoryWithColumns;
  schoolId?: string;
  userId?: string;
  onDownload?: (categoryId?: string) => void;
  onUpload?: (file: File, categoryId?: string) => Promise<void>;
  onImportComplete?: (result: ImportResult) => void;
  // Legacy props for backward compatibility
  onDownloadLegacy?: (categoryId?: string) => void;
  onUploadLegacy?: (file: File, categoryId?: string) => Promise<void>;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ 
  category,
  schoolId,
  userId,
  onDownload,
  onUpload,
  onImportComplete,
  onDownloadLegacy,
  // onUploadLegacy
}) => {
  const { t } = useLanguageSafe();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Legacy file change handler for backward compatibility
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setIsUploading(true);
      
      try {
        if (onUpload) {
          await onUpload(file);
        } else if (onUploadLegacy) {
          await onUploadLegacy(file);
        }
      } catch (error) {
        console.error("File upload error:", error);
      } finally {
        setIsUploading(false);
      }
      
      // Reset the input
      event.target.value = '';
    }
  };
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      if (onDownload) {
        onDownload();
      } else if (onDownloadLegacy) {
        onDownloadLegacy();
      }
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Handle enhanced import
  const handleEnhancedImport = () => {
    setShowImportDialog(true);
  };
  
  const handleImportDialogComplete = (result: ImportResult) => {
    setShowImportDialog(false);
    if (onImportComplete) {
      onImportComplete(result);
    }
  };
  
  // Determine which mode to use based on available props
  const useEnhancedMode = category && schoolId && userId;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-1" />
        )}
        {t('excelTemplate')}
      </Button>
      
      {useEnhancedMode ? (
        // Enhanced import button
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEnhancedImport}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          {t('importExcel')}
        </Button>
      ) : (
        // Legacy upload method
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            {t('uploadExcel')}
          </Button>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}
      
      {/* Enhanced Import Dialog */}
      {useEnhancedMode && (
        <ExcelImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          category={category!}
          schoolId={schoolId!}
          userId={userId!}
          onImportComplete={handleImportDialogComplete}
        />
      )}
    </>
  );
};

export default ExcelActions;
