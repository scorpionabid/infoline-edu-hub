
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryStatsProps {
  stats: {
    totalCategories: number;
    activeCategories: number;
    totalColumns: number;
    pendingApprovals: number;
  } | undefined;
  isLoading: boolean;
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ stats, isLoading }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isLoading ? "..." : stats?.totalCategories}</div>
            <p className="text-muted-foreground">{t("totalCategories")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isLoading ? "..." : stats?.activeCategories}</div>
            <p className="text-muted-foreground">{t("activeCategories")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isLoading ? "..." : stats?.totalColumns}</div>
            <p className="text-muted-foreground">{t("totalColumns")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isLoading ? "..." : stats?.pendingApprovals}</div>
            <p className="text-muted-foreground">{t("pendingApprovals")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryStats;
