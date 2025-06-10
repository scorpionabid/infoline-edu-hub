
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { CategoryWithColumns } from '@/types/category';
import { ImportResult, ImportError } from '@/types/excel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExcelService } from '@/services/excelService';
import { useToast } from '@/hooks/use-toast';

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryWithColumns;
  schoolId: string;
  userId: string;
  onImportComplete: (result: ImportResult) => void;
}

const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  isOpen,
  onClose,
  category,
  schoolId,
  userId,
  onImportComplete
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
      } else {
        setImportStatus('error');
        setImportMessage('Yalnız Excel faylları (.xlsx, .xls) qəbul edilir');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await ExcelService.downloadTemplate(category, schoolId);
      toast({
        title: 'Uğurlu',
        description: 'Template uğurla yükləndi'
      });
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Template yüklənməsində xəta baş verdi',
        variant: 'destructive'
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportStatus('idle');

    try {
      const result = await ExcelService.importExcelFile(
        selectedFile,
        category.id,
        schoolId,
        userId
      );

      setImportStatus('success');
      setImportMessage(`${result.successfulRows} sətir uğurla import edildi`);
      onImportComplete(result);
      
      setTimeout(() => {
        onClose();
        resetDialog();
      }, 2000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Import zamanı xəta baş verdi');
    } finally {
      setImporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImporting(false);
    setImportStatus('idle');
    setImportMessage('');
    setDragActive(false);
  };

  const handleClose = () => {
    if (!importing) {
      onClose();
      resetDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Excel Import - {category.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Template yüklə</h4>
                <p className="text-sm text-muted-foreground">
                  Düzgün formatda template yükləyin
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                Yüklə
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Silin
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-lg font-medium">Excel fayl seçin</p>
                <p className="text-sm text-muted-foreground">
                  Faylı bura sürüşdürün və ya seçin
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Status Messages */}
          {importStatus !== 'idle' && (
            <Alert variant={importStatus === 'error' ? 'destructive' : 'default'}>
              {importStatus === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{importMessage}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={importing}>
              Ləğv et
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
            >
              {importing ? 'Import edilir...' : 'Import et'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportDialog;
