import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  BarChart3,
  Users,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

import { useTranslation } from '@/contexts/TranslationContext';
import { ApprovalItem } from '@/services/approval/enhancedApprovalService';
import { DataEntryStatus } from '@/types/core/dataEntry';

interface BulkReviewPanelProps {
  selectedItems: ApprovalItem[];
  onBulkApprove?: (itemIds: string[], comment?: string) => Promise<void>;
  onBulkReject?: (itemIds: string[], reason: string, comment?: string) => Promise<void>;
  onClearSelection?: () => void;
  className?: string;
}

interface AggregatedStats {
  totalItems: number;
  averageCompletion: number;
  completionRates: number[];
  schoolsCount: number;
  categoriesCount: number;
  commonIssues: {
    type: string;
    count: number;
    description: string;
  }[];
}

interface BulkValidationResult {
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  issues: {
    itemId: string;
    schoolName: string;
    categoryName: string;
    issueType: 'error' | 'warning';
    description: string;
  }[];
}

export const BulkReviewPanel: React.FC<BulkReviewPanelProps> = ({
  selectedItems,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  className
}) => {
  const { t } = useTranslation();
  
  // State management
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [bulkComment, setBulkComment] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  const [validationResult, setValidationResult] = useState<BulkValidationResult | null>(null);

  // Calculate aggregated statistics
  useEffect(() => {
    if (selectedItems.length > 0) {
      calculateAggregatedStats();
      performBulkValidation();
    } else {
      setAggregatedStats(null);
      setValidationResult(null);
    }
  }, [selectedItems]);

  // Calculate aggregated statistics
  const calculateAggregatedStats = () => {
    if (selectedItems.length === 0) return;

    const completionRates = selectedItems.map(item => item.completionRate);
    const averageCompletion = Math.round(
      completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
    );

    const uniqueSchools = new Set(selectedItems.map(item => item.schoolId));
    const uniqueCategories = new Set(selectedItems.map(item => item.categoryId));

    // Analyze common issues
    const issuesMap = new Map<string, number>();
    
    selectedItems.forEach(item => {
      // Check completion rate issues
      if (item.completionRate < 50) {
        const key = 'low_completion';
        issuesMap.set(key, (issuesMap.get(key) || 0) + 1);
      }
      
      if (item.completionRate < 100) {
        const key = 'incomplete_data';
        issuesMap.set(key, (issuesMap.get(key) || 0) + 1);
      }

      // Check deadline issues (if applicable)
      if (item.submittedAt) {
        const submissionDate = new Date(item.submittedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 7) {
          const key = 'late_submission';
          issuesMap.set(key, (issuesMap.get(key) || 0) + 1);
        }
      }
    });

    const commonIssues = Array.from(issuesMap.entries()).map(([type, count]) => ({
      type,
      count,
      description: getIssueDescription(type)
    })).sort((a, b) => b.count - a.count);

    setAggregatedStats({
      totalItems: selectedItems.length,
      averageCompletion,
      completionRates,
      schoolsCount: uniqueSchools.size,
      categoriesCount: uniqueCategories.size,
      commonIssues
    });
  };

  // Perform bulk validation
  const performBulkValidation = () => {
    const issues: BulkValidationResult['issues'] = [];
    let errorCount = 0;
    let warningCount = 0;

    selectedItems.forEach(item => {
      // Check for validation errors
      if (item.completionRate < 50) {
        issues.push({
          itemId: item.id,
          schoolName: item.schoolName,
          categoryName: item.categoryName,
          issueType: 'error',
          description: 'Tamamlanma faizi çox aşağıdır (50%-dən az)'
        });
        errorCount++;
      }

      // Check for warnings
      if (item.completionRate < 100 && item.completionRate >= 50) {
        issues.push({
          itemId: item.id,
          schoolName: item.schoolName,
          categoryName: item.categoryName,
          issueType: 'warning',
          description: 'Bəzi sahələr doldurulmayıb'
        });
        warningCount++;
      }

      // Check status consistency
      if (item.status !== DataEntryStatus.PENDING) {
        issues.push({
          itemId: item.id,
          schoolName: item.schoolName,
          categoryName: item.categoryName,
          issueType: 'warning',
          description: `Məlumat statusu: ${item.status}`
        });
        warningCount++;
      }
    });

    setValidationResult({
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
      errorCount,
      warningCount,
      issues
    });
  };

  // Get issue description
  const getIssueDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'low_completion': 'Tamamlanma faizi 50%-dən az',
      'incomplete_data': 'Natamam məlumatlar',
      'late_submission': 'Gecikmiş təqdimət (7+ gün)',
      'missing_required': 'Məcburi sahələr boşdur',
      'validation_errors': 'Validation xətaları'
    };
    
    return descriptions[type] || 'Naməlum problem';
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (!onBulkApprove) return;
    
    setIsProcessing(true);
    try {
      const itemIds = selectedItems.map(item => item.id);
      await onBulkApprove(itemIds, bulkComment || undefined);
      resetAction();
      onClearSelection?.();
    } catch (error) {
      console.error('Bulk approval failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (!onBulkReject || !bulkReason.trim()) return;
    
    setIsProcessing(true);
    try {
      const itemIds = selectedItems.map(item => item.id);
      await onBulkReject(itemIds, bulkReason, bulkComment || undefined);
      resetAction();
      onClearSelection?.();
    } catch (error) {
      console.error('Bulk rejection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset action
  const resetAction = () => {
    setActionType(null);
    setBulkComment('');
    setBulkReason('');
  };

  // Get completion rate color
  const getCompletionColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Empty state
  if (selectedItems.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Heç bir element seçilməyib</p>
          <p className="text-sm text-muted-foreground">
            Toplu əməliyyatlar üçün bir və ya bir neçə element seçin
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Toplu Əməliyyatlar ({selectedItems.length} element)
            </div>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              Seçimi təmizlə
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Aggregated Statistics */}
      {aggregatedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{aggregatedStats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Seçilmiş element</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getCompletionColor(aggregatedStats.averageCompletion)}`}>
                {aggregatedStats.averageCompletion}%
              </div>
              <div className="text-sm text-muted-foreground">Ortalama tamamlanma</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{aggregatedStats.schoolsCount}</div>
              <div className="text-sm text-muted-foreground">Məktəb</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{aggregatedStats.categoriesCount}</div>
              <div className="text-sm text-muted-foreground">Kateqoriya</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (validationResult.hasErrors || validationResult.hasWarnings) && (
        <Alert variant={validationResult.hasErrors ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              {validationResult.hasErrors && (
                <div className="font-medium text-red-600">
                  {validationResult.errorCount} validation xətası tapıldı
                </div>
              )}
              {validationResult.hasWarnings && (
                <div className="font-medium text-yellow-600">
                  {validationResult.warningCount} xəbərdarlıq var
                </div>
              )}
              
              {validationResult.issues.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Ətraflı məlumat göstər
                  </summary>
                  <div className="mt-2 space-y-1">
                    {validationResult.issues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{issue.schoolName}</span> - {issue.description}
                      </div>
                    ))}
                    {validationResult.issues.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        və {validationResult.issues.length - 5} digər...
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Common Issues */}
      {aggregatedStats && aggregatedStats.commonIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ümumi Problemlər
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aggregatedStats.commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">{issue.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.count} elementdə tapıldı
                    </div>
                  </div>
                  <Badge variant="outline">
                    {Math.round((issue.count / aggregatedStats.totalItems) * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Items Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Seçilmiş Elementlər
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Məktəb</TableHead>
                  <TableHead>Kateqoriya</TableHead>
                  <TableHead>Tamamlanma</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.schoolName}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>
                      <span className={getCompletionColor(item.completionRate)}>
                        {item.completionRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === DataEntryStatus.PENDING ? 'secondary' :
                        item.status === DataEntryStatus.APPROVED ? 'default' : 'destructive'
                      }>
                        {item.status === DataEntryStatus.PENDING && 'Gözləmədə'}
                        {item.status === DataEntryStatus.APPROVED && 'Təsdiqlənmiş'}
                        {item.status === DataEntryStatus.REJECTED && 'Rədd edilmiş'}
                        {item.status === DataEntryStatus.DRAFT && 'Layihə'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Toplu Əməliyyatlar</CardTitle>
        </CardHeader>
        <CardContent>
          {actionType ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {actionType === 'approve' ? 'Toplu Təsdiq' : 'Toplu Rədd'}
                </h3>
                <Button variant="outline" onClick={resetAction}>
                  Ləğv et
                </Button>
              </div>
              
              {actionType === 'reject' && (
                <div>
                  <Label htmlFor="bulk-reason">Rədd səbəbi *</Label>
                  <Textarea
                    id="bulk-reason"
                    placeholder="Məlumatları niyə rədd etdiyinizi izah edin..."
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="bulk-comment">Əlavə şərh (istəyə bağlı)</Label>
                <Textarea
                  id="bulk-comment"
                  placeholder="Bütün elementlər üçün ümumi şərh..."
                  value={bulkComment}
                  onChange={(e) => setBulkComment(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Bu əməliyyat {selectedItems.length} elementə tətbiq ediləcək və geri alına bilməz. 
                  Bütün məktəb adminlərinə avtomatik bildirişlər göndəriləcək.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={actionType === 'approve' ? handleBulkApprove : handleBulkReject}
                  disabled={isProcessing || (actionType === 'reject' && !bulkReason.trim())}
                  className="flex-1"
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : actionType === 'approve' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionType === 'approve' ? 'Hamısını təsdiqlə' : 'Hamısını rədd et'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {selectedItems.length} element seçilmişdir. Toplu əməliyyat seçin:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={() => setActionType('approve')}
                  className="h-16 flex-col"
                  disabled={validationResult?.hasErrors}
                >
                  <CheckCircle className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Hamısını təsdiqlə</div>
                    <div className="text-xs opacity-80">Bütün seçilmiş məlumatları qəbul et</div>
                  </div>
                </Button>
                
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => setActionType('reject')}
                  className="h-16 flex-col"
                >
                  <XCircle className="h-6 w-6 mb-2" />
                  <div>
                    <div className="font-medium">Hamısını rədd et</div>
                    <div className="text-xs opacity-80">Bütün seçilmiş məlumatları geri göndər</div>
                  </div>
                </Button>
              </div>

              {validationResult?.hasErrors && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Bəzi elementlərdə validation xətaları var. Toplu təsdiq mümkün deyil.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkReviewPanel;