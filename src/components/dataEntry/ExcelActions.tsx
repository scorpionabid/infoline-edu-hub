
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/components/ui/use-toast';

interface ExcelActionsProps {
  downloadExcelTemplate: () => void;
  downloadCategoryTemplate: () => void;
  uploadExcelData: (file: File) => void;
  formStatus: string;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ 
  downloadExcelTemplate, 
  downloadCategoryTemplate,
  uploadExcelData,
  formStatus
}) => {
  const { t } = useLanguage();
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Excel faylını yükləmə simulyasiyası
      setTimeout(() => {
        uploadExcelData(file);
        setIsUploading(false);
        toast({
          title: t('excelDataUploaded'),
          description: t('dataSuccessfullyUploaded'),
        });
        // Faylı sıfırla
        if (fileInput) fileInput.value = '';
      }, 1500);
    }
  };

  const triggerFileInput = () => {
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
        ref={(input) => setFileInput(input)}
      />
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExcelDropdownOpen(!excelDropdownOpen)}
            disabled={formStatus === 'approved'}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('excelTemplate')}
          </Button>
          
          {excelDropdownOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadExcelTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('downloadAllTemplate')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadCategoryTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('downloadCurrentTemplate')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={triggerFileInput}
          disabled={isUploading || formStatus === 'approved'}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? t('uploading') : t('uploadWithExcel')}
        </Button>
      </div>
    </div>
  );
};

export default ExcelActions;
