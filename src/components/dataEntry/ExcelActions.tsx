
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/components/ui/use-toast';

interface ExcelActionsProps {
  downloadExcelTemplate: (categoryId?: string) => void;
  downloadCategoryTemplate: () => void;
  uploadExcelData: (file: File, categoryId?: string) => void;
  formStatus: string;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ 
  downloadExcelTemplate, 
  downloadCategoryTemplate,
  uploadExcelData,
  formStatus
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryOnly: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Excel faylını yükləmə simulyasiyası
      setTimeout(() => {
        // Əgər yalnız cari kateqoriya üçündürsə
        if (categoryOnly) {
          uploadExcelData(file, 'currentCategory'); // Real implementasiyada burada cari kateqoriya ID-si göndərilməlidir
        } else {
          uploadExcelData(file);
        }
        setIsUploading(false);
        
        // Faylı sıfırla
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setUploadDropdownOpen(false);
      }, 1500);
    }
  };

  const triggerFileUpload = (categoryOnly: boolean = false) => {
    if (fileInputRef.current) {
      // categoryOnly parametrini data attribute kimi saxlayırıq
      fileInputRef.current.dataset.categoryOnly = String(categoryOnly);
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const categoryOnly = fileInputRef.current?.dataset.categoryOnly === 'true';
          handleFileUpload(e, categoryOnly);
        }}
        ref={fileInputRef}
      />
      
      <div className="flex items-center gap-2">
        {/* Excel şablonu endirmə düyməsi */}
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
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadExcelTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('downloadAllTemplate')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => {
                    downloadCategoryTemplate();
                    setExcelDropdownOpen(false);
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('downloadCurrentTemplate')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Excel ilə yükləmə düyməsi */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUploadDropdownOpen(!uploadDropdownOpen)}
            disabled={isUploading || formStatus === 'approved'}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? t('uploading') : t('uploadWithExcel')}
          </Button>
          
          {uploadDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
              <div className="p-2">
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => triggerFileUpload(false)}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('uploadCompleteForm')}
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => triggerFileUpload(true)}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('uploadCurrentCategoryOnly')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelActions;
