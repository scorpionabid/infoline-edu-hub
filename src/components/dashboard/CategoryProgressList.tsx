import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { CategoryItem } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface CategoryProgressListProps {
  categories: CategoryItem[];
}

const CategoryProgressList: React.FC<CategoryProgressListProps> = ({
  categories,
}) => {
  const { t } = useTranslation();

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t("noCategoriesFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const completionRate =
          category.completionRate || category.completion || 0;

        return (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
              {category.deadline && (
                <div className="flex items-center text-xs mt-2 text-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("deadline")}: {category.deadline}
                </div>
              )}
            </div>
            <div className="w-24">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryProgressList;
