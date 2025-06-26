import React from "react";
import { Report, REPORT_TYPE_VALUES } from "@/types/core/report";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";

interface ReportChartViewProps {
  report: Report;
  height?: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const ReportChartView: React.FC<ReportChartViewProps> = ({
  report,
  height = 400,
}) => {
  const { t } = useTranslation();

  if (!report || !report.content) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        {t("noDataAvailable")}
      </div>
    );
  }

  // Extract data from report content
  const data = Array.isArray(report.content.data) ? report.content.data : [];
  const metrics = report.content.metrics || [];
  const tableData = report.content.tableData || { headers: [], rows: [] };

  // Render based on report type
  switch (report.type) {
    case REPORT_TYPE_VALUES.BAR: {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(data[0] || {})
              .filter((key) => key !== "name")
              .map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case REPORT_TYPE_VALUES.LINE: {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(data[0] || {})
              .filter((key) => key !== "name")
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case REPORT_TYPE_VALUES.PIE: {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case REPORT_TYPE_VALUES.TABLE: {
      return (
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableCaption>{report.title}</TableCaption>
            <TableHeader>
              <TableRow>
                {tableData.headers?.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.rows?.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell: any, cellIndex: number) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case REPORT_TYPE_VALUES.METRICS: {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                {metric.change && (
                  <div
                    className={`text-xs ${metric.change > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          {t("unsupportedReportType")}
        </div>
      );
  }
};

export default ReportChartView;
