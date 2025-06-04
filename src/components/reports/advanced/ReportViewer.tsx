
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { AdvancedReportData } from '@/types/advanced-report';
import ChartView from '../views/ChartView';
import { format } from 'date-fns';
import { Calendar, User, Database, TrendingUp, Lightbulb } from 'lucide-react';

interface ReportViewerProps {
  report: AdvancedReportData;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{report.title}</h2>
            {report.description && (
              <p className="text-muted-foreground mt-1">{report.description}</p>
            )}
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {t(report.type)}
          </Badge>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(report.generatedAt), 'PPp')}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {t('generatedBy')}: {report.generatedBy}
          </div>
          {report.metadata && (
            <div className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              {report.metadata.totalRecords} {t('records')}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('dataVisualization')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartView
            data={report.data}
            type="bar"
            height={400}
            config={{
              xAxisKey: 'name',
              yAxisKey: 'completion_rate',
              colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
              showGrid: true,
              showLegend: true
            }}
          />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('rawData')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {report.data.length > 0 && Object.keys(report.data[0]).map(key => (
                    <th key={key} className="border border-gray-200 px-4 py-2 text-left font-medium">
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.data.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {Object.values(row).map((value, colIndex) => (
                      <td key={colIndex} className="border border-gray-200 px-4 py-2">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {report.insights && report.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t('insights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('recommendations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {report.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>{t('reportMetadata')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('dataSource')}:</span>
                <p className="text-muted-foreground">{report.metadata.dataSource}</p>
              </div>
              <div>
                <span className="font-medium">{t('totalRecords')}:</span>
                <p className="text-muted-foreground">{report.metadata.totalRecords}</p>
              </div>
              <div>
                <span className="font-medium">{t('lastUpdated')}:</span>
                <p className="text-muted-foreground">
                  {format(new Date(report.metadata.lastUpdated), 'PPp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportViewer;
