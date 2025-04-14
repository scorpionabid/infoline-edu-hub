
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Upload, Download, Send } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntrySaveBarProps {
  lastSaved?: string;
  isSaving: boolean;
  isSubmitting: boolean;
  completionPercentage: number;
  onSave: () => void;
  onSubmit: () => void;
  onDownloadTemplate: () => void;
  onUploadData: (file: File) => void;
  readOnly?: boolean;
}

const DataEntrySaveBar: React.FC<DataEntrySaveBarProps> = ({
  lastSaved,
  isSaving,
  isSubmitting,
  completionPercentage,
  onSave,
  onSubmit,
  onDownloadTemplate,
  onUploadData,
  readOnly = false
}) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast({
          title: t('invalidFileType'),
          description: t('pleaseUploadExcelFile'),
          variant: 'destructive'
        });
        return;
      }
      
      onUploadData(file);
      // Faylı sıfırla ki, eyni faylı yenidən seçə bilsinlər
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx"
      />
      
      <div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            {t('lastSaved')}: {formatDistanceToNow(new Date(lastSaved), { addSuffix: true, locale: az })}
          </p>
        )}
        {completionPercentage !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  completionPercentage >= 100
                    ? 'bg-green-500'
                    : completionPercentage >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, completionPercentage)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDownloadTemplate}
                disabled={readOnly}
              >
                <Download className="h-4 w-4 mr-1" />
                {t('downloadTemplate')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('downloadTemplateTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUploadClick}
                disabled={readOnly}
              >
                <Upload className="h-4 w-4 mr-1" />
                {t('uploadExcel')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('uploadExcelTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSave} 
          disabled={isSaving || readOnly}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              {t('save')}
            </>
          )}
        </Button>

        <Button 
          variant="default" 
          size="sm" 
          onClick={onSubmit} 
          disabled={isSubmitting || completionPercentage < 100 || readOnly}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              {t('submitForApproval')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DataEntrySaveBar;
