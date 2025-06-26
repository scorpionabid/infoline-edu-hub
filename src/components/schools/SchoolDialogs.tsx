import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  adminEmail?: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  isOpen,
  onClose,
  schoolId,
  schoolName,
  adminEmail,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!adminEmail) {
      toast.error(t("noAdminEmailFound"));
      return;
    }

    setIsLoading(true);
    try {
      // Use resetPasswordForEmail instead of a custom function
      const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(t("passwordResetLinkSent"), {
        description: t("passwordResetLinkSentDescription", {
          email: adminEmail,
        }),
      });
      onClose();
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(t("errorResettingPassword"), {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("resetAdminPassword")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("school")}
            </Label>
            <Input
              id="name"
              value={schoolName}
              // disabled
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t("adminEmail")}
            </Label>
            <Input
              id="email"
              value={adminEmail || t("noEmailFound")}
              // disabled
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isLoading || !adminEmail}
          >
            {isLoading ? t("sending") : t("sendResetLink")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
