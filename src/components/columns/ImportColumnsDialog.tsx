
import React, { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImportColumnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<void>;
}

export const ImportColumnsDialog: React.FC<ImportColumnsDialogProps> = ({
  open,
  onOpenChange,
  // onImport
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      await onImport(selectedFile);
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error importing columns:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('columns.import_columns')}</DialogTitle>
          <DialogDescription>
            {t('columns.import_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('ui.cancel')}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? t('ui.importing') : t('ui.import')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportColumnsDialog;
