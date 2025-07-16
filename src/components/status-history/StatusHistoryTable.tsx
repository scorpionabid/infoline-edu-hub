import React from 'react';
import { useStatusHistory } from '@/hooks/useStatusHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Download, Clock, User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

/**
 * Status History Table Component
 * 
 * Bu komponent status dəyişikliklərinin tarixçəsini göstərir və
 * Security Advisor tələblərinə uyğun secure əməliyyatlar həyata keçirir.
 */

interface StatusHistoryTableProps {
  entryId?: string;
  maxHeight?: string;
  showActions?: boolean;
  autoRefresh?: boolean;
  limit?: number;
  className?: string;
}

export const StatusHistoryTable: React.FC<StatusHistoryTableProps> = ({
  entryId,
  maxHeight = '400px',
  showActions = true,
  autoRefresh = false,
  limit = 50,
  className = ''
}) => {
  const { 
    history, 
    loading, 
    error, 
    hasData, 
    refresh, 
    exportHistory,
    testConnection
  } = useStatusHistory({ entryId, limit, autoRefresh }) || {};

  /**
   * Status rəng kodunu qaytarır
   */
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'hazırlanır':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'gözləyir':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'təsdiqlənib':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'rədd edilib':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Export functionality
   */
  const handleExport = async () => {
    try {
      const data = await exportHistory();
      if (data && data.length > 0) {
        const csv = convertToCSV(data);
        downloadCSV(csv, 'status-history.csv');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  /**
   * Convert data to CSV format
   */
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Test database connection
   */
  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      console.log('Connection test result:', result);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">
              Status Tarixçəsi
            </CardTitle>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Status Tarixçəsi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription className="flex justify-between items-center">
              <div>
                <strong>Xəta baş verdi:</strong>
                <p className="text-sm mt-1">{String(error)}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={refresh}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Yenidən
                </Button>
                <Button 
                  onClick={handleTestConnection}
                  variant="outline"
                  size="sm"
                >
                  Test
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            Status Tarixçəsi
            {hasData && (
              <Badge variant="secondary" className="ml-2">
                {history.length}
              </Badge>
            )}
          </CardTitle>
          
          {showActions && (
            <div className="flex space-x-2">
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Yenilə
              </Button>
              
              {hasData && (
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasData ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Status dəyişikliyi tarixçəsi yoxdur</p>
          </div>
        ) : (
          <div 
            className="space-y-3 overflow-auto"
            style={{ maxHeight }}
          >
            {history.map((entry) => (
              <div 
                key={entry.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(entry.old_status)}>
                        {entry.old_status}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className={getStatusColor(entry.new_status)}>
                        {entry.new_status}
                      </Badge>
                    </div>
                    
                    {entry.comment && (
                      <div className="flex items-start space-x-2 mb-2 text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>{entry.comment}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{entry.changed_by_name}</span>
                      {entry.changed_by_email && (
                        <span className="text-xs">({entry.changed_by_email})</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 flex-shrink-0 ml-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(
                          new Date(entry.changed_at), 
                          { addSuffix: true, locale: az }
                        )}
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      {new Date(entry.changed_at).toLocaleString('az-AZ')}
                    </div>
                  </div>
                </div>
                
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-700">
                        Əlavə məlumat
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusHistoryTable;
