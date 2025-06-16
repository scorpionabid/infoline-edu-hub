import React from "react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export const UserEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {t("noAvailableUsers") || "Əlavə ediləcək istifadəçi tapılmadı"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {t("tryAddingNewUser") ||
          "İstifadəçilər bölməsindən yeni istifadəçi əlavə edə bilərsiniz"}
      </p>
    </div>
  );
};
