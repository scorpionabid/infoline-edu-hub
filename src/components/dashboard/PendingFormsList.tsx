import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { FormItem } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PendingFormsListProps {
  forms: FormItem[];
  limit?: number;
  showViewAllButton?: boolean;
}

const PendingFormsList: React.FC<PendingFormsListProps> = ({
  forms,
  limit = 5,
  showViewAllButton = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!forms || forms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("noFormsFound")}</p>
      </div>
    );
  }

  const displayedForms = forms.slice(0, limit);

  return (
    <div className="space-y-4">
      {displayedForms.map((form) => (
        <div
          key={form.id}
          className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
        >
          <div>
            <h4 className="font-medium">{form.title || form.name}</h4>
            <div className="text-sm text-muted-foreground">
              {form.category && `${t("category")}: ${form.category}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("status")}: {form.status}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-4"
            onClick={() => navigate(`/forms/${form.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("view")}
          </Button>
        </div>
      ))}

      {showViewAllButton && forms.length > limit && (
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => navigate("/forms")}
        >
          {t("viewAll")} ({forms.length})
        </Button>
      )}
    </div>
  );
};

export default PendingFormsList;
