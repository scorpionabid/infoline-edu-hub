import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserData } from "@/types/user";
import { useTranslation } from "@/contexts/TranslationContext";
import { formatDistanceToNow } from "date-fns";

interface UserDetailsDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  if (!user) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "destructive";
      case "regionadmin":
        return "default";
      case "sectoradmin":
        return "secondary";
      case "schooladmin":
        return "outline";
      default:
        return "outline";
    }
  };

  const getEntityName = () => {
    return user.entity_name || user.entityName || "Təyin edilməyib";
  };

  const getEntityType = () => {
    switch (user.role) {
      case "regionadmin":
        return getEntityName() || "Region təyin edilməyib";
      case "sectoradmin":
        return getEntityName() || "Sektor təyin edilməyib";
      case "schooladmin":
        return getEntityName() || "Məktəb təyin edilməyib";
      default:
        return "Sistem administratoru";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("userDetails") || "İstifadəçi məlumatları"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("fullName") || "Ad Soyad"}
              </label>
              <p className="text-sm">{user.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("email") || "E-poçt"}
              </label>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("phone") || "Telefon"}
              </label>
              <p className="text-sm">{user.phone || "Təyin edilməyib"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("position") || "Vəzifə"}
              </label>
              <p className="text-sm">{user.position || "Təyin edilməyib"}</p>
            </div>
          </div>

          {/* Role and Entity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("role") || "Rol"}
              </label>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {user.role === "regionadmin" && "Region"}
                {user.role === "sectoradmin" && "Sektor"}
                {user.role === "schooladmin" && "Məktəb"}
                {user.role === "superadmin" && "Səlahiyyət"}
              </label>
              <p className="text-sm">{getEntityType()}</p>
            </div>
          </div>

          {/* Status and Activity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("status") || "Status"}
              </label>
              <div className="mt-1">
                <Badge
                  variant={user.status === "active" ? "default" : "secondary"}
                >
                  {user.status === "active"
                    ? t("active") || "Aktiv"
                    : t("inactive") || "Qeyri-aktiv"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("lastLogin") || "Son giriş"}
              </label>
              <p className="text-sm">
                {user.last_login
                  ? formatDistanceToNow(new Date(user.last_login), {
                      addSuffix: true,
                    })
                  : "Heç vaxt"}
              </p>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t("language") || "Dil"}
            </label>
            <p className="text-sm">{user.language || "az"}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <label className="font-medium">
                {t("createdAt") || "Yaradılma tarixi"}
              </label>
              <p>{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="font-medium">
                {t("updatedAt") || "Yenilənmə tarixi"}
              </label>
              <p>{new Date(user.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
