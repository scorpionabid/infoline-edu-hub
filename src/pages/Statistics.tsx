import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useStatistics } from "@/hooks/statistics/useStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  School,
  MapPin,
  BarChart3,
} from "lucide-react";
import { StatisticsFilters } from "@/components/statistics/StatisticsFilters";
import { StatisticsCharts } from "@/components/statistics/StatisticsCharts";
import { StatisticsExport } from "@/components/statistics/StatisticsExport";
import { StatisticsFilters as IStatisticsFilters } from "@/services/statisticsService";
import LoadingScreen from "@/components/auth/LoadingScreen";

const Statistics = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [filters, setFilters] = useState<IStatisticsFilters>({});

  const { data: statisticsData, isLoading, error } = useStatistics(filters);

  const handleFiltersChange = (newFilters: IStatisticsFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return <LoadingScreen message="Statistika məlumatları yüklənir..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {t("statistics.errorLoading") ||
              "Statistika məlumatlarını yüklərkən xəta baş verdi"}
            : {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!statisticsData) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertDescription>
            {t("statistics.noData") || "Statistika məlumatları mövcud deyil"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {t("navigation.statistics") || "Statistika"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("statistics.lastUpdated") || "Son yenilənmə"}:{" "}
          {new Date().toLocaleString("az-AZ")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sol panel - Filtrlər və Export */}
        <div className="space-y-6">
          <StatisticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
            userRole={
              isSuperAdmin
                ? "superadmin"
                : isRegionAdmin
                  ? "regionadmin"
                  : "sectoradmin"
            }
          />

          <StatisticsExport
            data={statisticsData}
            filters={filters}
          />
        </div>

        {/* Sağ panel - Məzmun */}
        <div className="lg:col-span-3 space-y-6">
          {/* Ümumi statistika kartları */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("statistics.totalSchools") || "Toplam Məktəblər"}
                </CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statisticsData.totalSchools}
                </div>
                <p className="text-xs text-muted-foreground">
                  Qeydiyyatlı məktəblər
                </p>
              </CardContent>
            </Card>

            {isSuperAdmin && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t("statistics.totalUsers") || "Toplam İstifadəçilər"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statisticsData.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sistem istifadəçiləri
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("statistics.completionRate") || "Tamamlanma Dərəcəsi"}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statisticsData.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {statisticsData.completionRate > 50
                    ? t("statistics.aboveAverage") || "Ortalamadan yuxarı"
                    : t("statistics.belowAverage") || "Ortalamadan aşağı"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("statistics.pendingApprovals") || "Gözləyən Təsdiqlər"}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statisticsData.formsByStatus.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("statistics.needsReview") || "Nəzərdən keçirilməlidir"}
                </p>
              </CardContent>
            </Card>

            {isSuperAdmin && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("statistics.totalRegions") || "Toplam Regionlar"}
                    </CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statisticsData.totalRegions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      İdarə regionları
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("statistics.totalSectors") || "Toplam Sektorlar"}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statisticsData.totalSectors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Aktiv sektorlar
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("statistics.approvalRate") || "Təsdiq Dərəcəsi"}
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statisticsData.approvalRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("statistics.totalForms") || "Ümumi formlar"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("statistics.activeForms") || "Aktiv Formlar"}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statisticsData.formsByStatus.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("statistics.totalSubmissions") || "Toplam təqdimatlar"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performans metriklər */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("statistics.performanceMetrics") || "Performans Metriklər"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("statistics.completionRate") || "Tamamlanma dərəcəsi"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {statisticsData.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${statisticsData.completionRate}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t("statistics.approvalRate") || "Təsdiq dərəcəsi"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {statisticsData.approvalRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${statisticsData.approvalRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diaqramlar */}
          <StatisticsCharts data={statisticsData} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;
