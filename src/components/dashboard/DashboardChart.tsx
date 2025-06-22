import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTranslation } from "@/contexts/TranslationContext";
import { DashboardChartProps } from "@/types/dashboard";

const DashboardChart: React.FC<DashboardChartProps> = ({
  stats,
  showLegend = true,
  height = 300,
}) => {
  const { t } = useTranslation();

  const data = [
    { name: t("dashboard.statusTypes.approved"), value: stats.approved || 0, color: "#10b981" },
    { name: t("dashboard.statusTypes.pending"), value: stats.pending || 0, color: "#f59e0b" },
    { name: t("dashboard.statusTypes.rejected"), value: stats.rejected || 0, color: "#ef4444" },
    { name: t("dashboard.statusTypes.draft"), value: stats.draft || 0, color: "#6b7280" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.formStatistics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
