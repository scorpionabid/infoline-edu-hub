import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

const CategoryAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <FileBarChart className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {t("categoryAnalytics")}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {t("categoryAnalyticsDescription")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryAnalytics;
