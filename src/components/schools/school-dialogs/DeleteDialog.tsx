
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useLanguage } from '@/context/LanguageContext';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schoolName?: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  schoolName = "Məktəb" 
}) => {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Məktəbi sil</DialogTitle>
          <DialogDescription>
            <p>
              <strong>{schoolName}</strong> məktəbini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <p className="mt-2 text-destructive">
              Bu məktəbin bütün məlumatları və əlaqəli datalar silinəcək.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Silinir...
              </>
            ) : (
              'Sil'
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Ləğv et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
