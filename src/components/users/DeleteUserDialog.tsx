import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User } from '@/types/user';
import { useTranslation } from '@/contexts/TranslationContext';

interface DeleteUserDialogProps {
  user: Partial<User> | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: 'soft' | 'hard') => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const handleConfirm = () => {
    onConfirm(deleteType);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteUser") || "İstifadəçini Sil"}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>
                <strong>{user.full_name || user.email}</strong> istifadəçisini silmək istədiyinizə əminsiniz?
              </p>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("deleteType") || "Silmə növü:"}
                </Label>
                
                <div className="flex flex-wrap gap-4">
                  <RadioGroup 
                    value={deleteType} 
                    onValueChange={(value: 'soft' | 'hard') => setDeleteType(value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="soft" id="soft" className="mt-1" />
                      <Label htmlFor="soft" className="text-sm cursor-pointer">
                        <div>
                          <div className="font-medium">{t("softDelete") || "Yumşaq silmə"}</div>
                          <div className="text-xs text-muted-foreground max-w-[200px]">
                            {t("softDeleteDesc") || "İstifadəçi deaktiv ediləcək, məlumatlar saxlanacaq"}
                          </div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="hard" id="hard" className="mt-1" />
                      <Label htmlFor="hard" className="text-sm cursor-pointer">
                        <div>
                          <div className="font-medium text-destructive">
                            {t("hardDelete") || "Sərt silmə"}
                          </div>
                          <div className="text-xs text-muted-foreground max-w-[200px]">
                            {t("hardDeleteDesc") || "İstifadəçi və bütün məlumatları tamamilə silinəcək"}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex justify-end space-x-2">
          <AlertDialogCancel>{t("cancel") || "Ləğv Et"}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={`${deleteType === 'hard' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {deleteType === 'hard' ? (t("hardDelete") || "Sərt Sil") : (t("softDelete") || "Deaktiv Et")}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
