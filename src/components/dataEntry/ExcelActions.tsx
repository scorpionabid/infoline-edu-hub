
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileSpreadsheet, Upload } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';

export interface ExcelActionsProps {
  onDownload: (categoryId?: string) => void;
  onUpload: (file: File, categoryId?: string) => Promise<void>;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ onDownload, onUpload }) => {
  const { t } = useLanguageSafe();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setIsUploading(true);
      
      try {
        await onUpload(file);
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
      onDownload();
    } finally {
      setIsDownloading(false);
    }
  };
  
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
          <FileSpreadsheet className="h-4 w-4 mr-1" />
        )}
        {t('excelTemplate')}
      </Button>
      
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
    </>
  );
};

export default ExcelActions;
