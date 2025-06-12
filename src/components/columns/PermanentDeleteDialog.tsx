import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface PermanentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: {
    id: string;
    name: string;
    dataEntriesCount?: number;
  };
  onConfirm: (columnId: string) => void;
  isSubmitting?: boolean;
}

const PermanentDeleteDialog: React.FC<PermanentDeleteDialogProps> = ({
  open,
  onOpenChange,
  column,
  onConfirm,
  isSubmitting = false
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  
  const expectedConfirmation = `SİL ${column.name}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleConfirm = () => {
    if (isConfirmationValid) {
      onConfirm(column.id);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Tam silinmə
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            <strong>"{column.name}"</strong> sütununu tamamilə silmək istədiyinizə əminsiniz?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">DİQQƏT: Bu əməliyyat geri qaytarıla bilməz!</div>
              <div className="text-sm">
                • Sütun verilənlər bazasından tamamilə silinəcək
                • Bununla əlaqəli bütün məlumatlar itiriləcək
                • Bu əməliyyat geri qaytarıla bilməz
              </div>
              {column.dataEntriesCount && column.dataEntriesCount > 0 && (
                <div className="mt-2 text-sm font-medium">
                  ⚠️ {column.dataEntriesCount} məlumat qeydi də silinəcək
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Təsdiq üçün <code className="bg-gray-100 px-1 rounded text-sm">{expectedConfirmation}</code> yazın:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={expectedConfirmation}
              className={confirmationText && !isConfirmationValid ? 'border-destructive' : ''}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-destructive">
                Təsdiq mətni düzgün deyil
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isSubmitting}>
            Ləğv et
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Silinir...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Tam sil
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PermanentDeleteDialog;