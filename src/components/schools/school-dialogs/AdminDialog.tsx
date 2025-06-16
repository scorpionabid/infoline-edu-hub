import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { School } from "@/types/school";
import { useTranslation } from "@/contexts/TranslationContext";

export interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  school: School;
  onUpdate?: () => void;
  onResetPassword?: (newPassword: string) => void;
}

const AdminDialog: React.FC<AdminDialogProps> = ({
  open,
  onClose,
  school,
  onUpdate,
  onResetPassword,
}) => {
  const { t } = useTranslation();
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);

  useEffect(() => {
    if (open && school) {
      setAdminEmail(school.admin_email || "");
      setNewPassword("");
      setShowPasswordReset(false);
    }
  }, [open, school]);

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error(t("invalidPassword"), {
        description: t("passwordMinLength"),
      });
      return;
    }

    if (onResetPassword) {
      onResetPassword(newPassword);
      setNewPassword("");
      setShowPasswordReset(false);
      toast.success(t("passwordResetSuccess"), {
        description: t("passwordHasBeenReset"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("schoolAdminDetails")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("schoolName")}</Label>
            <div className="p-2 bg-gray-50 rounded border">{school?.name}</div>
          </div>
          <div className="space-y-2">
            <Label>{t("adminEmail")}</Label>
            <div className="p-2 bg-gray-50 rounded border">
              {adminEmail || t("noAdminAssigned")}
            </div>
          </div>

          {showPasswordReset && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="new-password">{t("newPassword")}</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("enterNewPassword")}
                  className="flex-1"
                />
                <Button onClick={handleResetPassword}>
                  {t("resetPassword")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={togglePasswordReset}>
            {showPasswordReset ? t("cancel") : t("resetPassword")}
          </Button>
          <Button onClick={onClose}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDialog;
