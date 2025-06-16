import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CircleCheck,
  Archive,
  FileEdit,
  CalendarClock,
  School,
  Factory,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface CategoryStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    draft: number;
    assignment: {
      all: number;
      sectors: number;
    };
    withDeadline: number;
  };
  isLoading?: boolean;
}

const CategoryStats: React.FC<CategoryStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary/10"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: t("totalCategories"),
      value: stats.total,
      icon: <FileEdit className="h-8 w-8 text-primary" />,
      bgClass: "bg-primary/10",
    },
    {
      label: t("activeCategories"),
      value: stats.active,
      icon: <CircleCheck className="h-8 w-8 text-green-500" />,
      bgClass: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: t("inactiveCategories"),
      value: stats.inactive,
      icon: <Archive className="h-8 w-8 text-yellow-500" />,
      bgClass: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      label: t("draftCategories"),
      value: stats.draft,
      icon: <FileEdit className="h-8 w-8 text-blue-500" />,
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: t("categoriesForAllSchools"),
      value: stats.assignment.all,
      icon: <School className="h-8 w-8 text-indigo-500" />,
      bgClass: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      label: t("categoriesForSectors"),
      value: stats.assignment.sectors,
      icon: <Factory className="h-8 w-8 text-purple-500" />,
      bgClass: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: t("categoriesWithDeadline"),
      value: stats.withDeadline,
      icon: <CalendarClock className="h-8 w-8 text-red-500" />,
      bgClass: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {statItems.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className={`rounded-full p-2 ${stat.bgClass}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <h2 className="text-2xl font-bold">{stat.value}</h2>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryStats;
