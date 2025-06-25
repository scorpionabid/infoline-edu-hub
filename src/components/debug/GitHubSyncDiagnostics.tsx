
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { gatherDiagnosticInfo, exportDiagnosticReport, SyncDiagnosticInfo } from '@/utils/githubSyncDiagnostics';

const GitHubSyncDiagnostics: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<SyncDiagnosticInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGatherInfo = async () => {
    setLoading(true);
    try {
      const info = await gatherDiagnosticInfo();
      setDiagnosticInfo(info);
      console.log('Diagnostic info gathered:', info);
    } catch (error) {
      console.error('Failed to gather diagnostic info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const report = await exportDiagnosticReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `infoline-sync-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          GitHub Sync Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issue:</strong> GitHub webhook sync failures detected. 
            This diagnostic tool gathers information to help the technical team resolve the issue.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={handleGatherInfo} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Gather Diagnostic Info
          </Button>
          <Button 
            onClick={handleExportReport} 
            variant="outline"
            disabled={!diagnosticInfo}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {diagnosticInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Timestamp:</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(diagnosticInfo.timestamp).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service Worker:</span>
                    <Badge variant={diagnosticInfo.cacheInfo.hasServiceWorker ? "default" : "destructive"}>
                      {diagnosticInfo.cacheInfo.hasServiceWorker ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cache Entries:</span>
                    <Badge variant="outline">
                      {diagnosticInfo.cacheInfo.cacheStorageSize}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Storage Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">LocalStorage Keys:</span>
                    <Badge variant="outline">
                      {Object.keys(diagnosticInfo.localStorage).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SessionStorage Keys:</span>
                    <Badge variant="outline">
                      {Object.keys(diagnosticInfo.sessionStorage).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current URL:</span>
                    <Badge variant="outline" className="text-xs max-w-32 truncate">
                      {diagnosticInfo.currentUrl}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Next Steps:</strong> Please export this diagnostic report and provide it to Lovable technical support along with your repository URL: https://github.com/scorpionabid/infoline-edu-hub
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubSyncDiagnostics;
