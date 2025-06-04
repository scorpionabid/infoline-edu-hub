
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useAdvancedReports } from '@/hooks/reports/useAdvancedReports';
import AdvancedReportBuilder from './AdvancedReportBuilder';
import ReportViewer from './ReportViewer';
import { BarChart3, FileText, TrendingUp, Users, School, Building } from 'lucide-react';
import { format } from 'date-fns';

const ReportDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { reports, templates } = useAdvancedReports();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'comparison':
        return <TrendingUp className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'comparison':
        return 'bg-green-100 text-green-800';
      case 'trend':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('advancedReporting')}</h1>
          <p className="text-muted-foreground">{t('advancedReportingDescription')}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalReports')}</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('templates')}</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('thisMonth')}</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => 
                    new Date(r.generatedAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('averageDataPoints')}</p>
                <p className="text-2xl font-bold">
                  {reports.length > 0 
                    ? Math.round(reports.reduce((acc, r) => acc + r.data.length, 0) / reports.length)
                    : 0
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">{t('reportBuilder')}</TabsTrigger>
          <TabsTrigger value="reports">{t('myReports')}</TabsTrigger>
          <TabsTrigger value="templates">{t('templates')}</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <AdvancedReportBuilder 
            onReportGenerated={(reportId) => {
              setSelectedReportId(reportId);
              setActiveTab('reports');
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>{t('generatedReports')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noReportsGenerated')}
                  </p>
                ) : (
                  reports.map(report => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReportId === report.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedReportId(report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getReportTypeIcon(report.type)}
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge className={getReportTypeColor(report.type)}>
                              {t(report.type)}
                            </Badge>
                          </div>
                          {report.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {report.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {t('generated')}: {format(new Date(report.generatedAt), 'PPp')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Report Viewer */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reportPreview')}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <ReportViewer report={selectedReport} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {t('selectReportToView')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getReportTypeIcon(template.type)}
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={getReportTypeColor(template.type)}>
                      {t(template.type)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      {t('useTemplate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportDashboard;
