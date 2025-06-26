import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserData, UserRole } from "@/types/user";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userData: Partial<UserData>) => Promise<void>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onSave,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        regionId: user.region_id || user.regionId,
        sectorId: user.sector_id || user.sectorId,
        schoolId: user.school_id || user.schoolId,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
      toast.success("İstifadəçi məlumatları yeniləndi");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("İstifadəçi yenilənərkən xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("editUser") || "İstifadəçini redaktə et"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">{t("fullName") || "Ad Soyad"}</Label>
            <Input
              id="full_name"
              value={formData.full_name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              // required
            />
          </div>

          <div>
            <Label htmlFor="email">{t("email") || "E-poçt"}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              // required
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("phone") || "Telefon"}</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="position">{t("position") || "Vəzifə"}</Label>
            <Input
              id="position"
              value={formData.position || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, position: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="status">{t("status") || "Status"}</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value: "active" | "inactive") =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("active") || "Aktiv"}</SelectItem>
                <SelectItem value="inactive">
                  {t("inactive") || "Qeyri-aktiv"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel") || "İmtina"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("saving") || "Yadda saxlanır..."
                : t("save") || "Yadda saxla"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
