import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';

interface DeleteUserDialogProps {
  user: Partial<User> | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Sil</Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>İstifadəçini Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{user.full_name || user.email}</strong> istifadəçisini silmək istədiyinizə əminsiniz?
            Bu əməliyyat geri qaytarıla bilməz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogCancel>Ləğv Et</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Sil</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
