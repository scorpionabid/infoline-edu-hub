import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Edit3, 
  Loader2, 
  Send, 
  Info, 
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { ProxyDataEntryService } from '@/services/dataEntry/proxyDataEntryService';

interface BulkDataEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchools: string[];
  categoryId: string;
  onComplete?: () => void;
}

/**
 * Bulk Data Entry Dialog
 * 
 * Bu komponent bir kateqoriya və sütun seçib, çoxlu məktəb üçün eyni dəyər daxil etməyə imkan verir.
 * 
 * Məsələn:
 * - Kateqoriya: "Təchizat məlumatları"  
 * - Sütun: "Oduna ehtiyac var?"
 * - Seçilmiş məktəblər: Məktəb A, B, C
 * - Dəyər: "Xeyr"
 * 
 * Nəticə: A, B, C məktəbləri üçün "Oduna ehtiyac var?" sütununa "Xeyr" dəyəri daxil edilir.
 */
export const BulkDataEntryDialog: React.FC<BulkDataEntryDialogProps> = ({
  isOpen,
  onClose,
  selectedSchools,
  categoryId,
  onComplete
}) => {
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  
  // State
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [bulkValue, setBulkValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState<{
    successful: string[];
    failed: { schoolId: string; error: string }[];
  } | null>(null);

  // Get category with ONLY ACTIVE columns
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-with-columns', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('id', categoryId)
        .eq('columns.status', 'active') // FILTER: Only active columns
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId && isOpen
  });

  // Get schools info
  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['bulk-schools', selectedSchools],
    queryFn: async () => {
      if (selectedSchools.length === 0) return [];
      
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', selectedSchools);
      
      if (error) throw error;
      return data;
    },
    enabled: selectedSchools.length > 0 && isOpen
  });

  // Get selected column info
  const selectedColumn = category?.columns?.find(col => col.id === selectedColumnId);
  
  const columns = category?.columns || [];

  // Handle bulk submission
  const handleBulkSubmit = async () => {
    if (!selectedColumnId || !bulkValue.trim()) {
      toast({
        title: 'Məlumat çatmır',
        description: 'Zəhmət olmasa sütun və dəyər seçin',
        variant: 'destructive'
      });
      return;
    }

    if (selectedSchools.length === 0) {
      toast({
        title: 'Məktəb seçilməyib',
        description: 'Zəhmət olmasa ən azı bir məktəb seçin',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResults(null);

    const successful: string[] = [];
    const failed: { schoolId: string; error: string }[] = [];

    try {
      // Process each school
      for (const schoolId of selectedSchools) {
        try {
          // Create form data with single column value
          const formData = { [selectedColumnId]: bulkValue };

          // Save proxy form data with updated interface
          const saveResult = await ProxyDataEntryService.saveProxyFormData(formData, {
            categoryId,
            schoolId,
            proxyUserId: user!.id,
            proxyReason: `Bulk data entry: ${selectedColumn?.name} = ${bulkValue}`,
            proxyOriginalEntity: schoolId
          });

          if (!saveResult.success) {
            throw new Error(saveResult.error || 'Saxlama xətası');
          }

          // Submit for auto-approval with updated interface
          const submitResult = await ProxyDataEntryService.submitProxyData({
            categoryId,
            schoolId,
            proxyUserId: user!.id,
            proxyUserRole: user!.role,
            proxyReason: `Bulk data entry: ${selectedColumn?.name} = ${bulkValue}`,
            autoApprove: true
          });

          if (!submitResult.success) {
            throw new Error(submitResult.error || 'Təsdiq xətası');
          }

          successful.push(schoolId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Naməlum xəta';
          failed.push({ schoolId, error: errorMessage });
        }
      }

      // Set results
      setSubmissionResults({ successful, failed });

      // Show success toast
      toast({
        title: 'Bulk əməliyyat tamamlandı',
        description: `${successful.length} məktəb uğurlu, ${failed.length} xətə`
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['proxyDataEntry']
      });

      // Call completion callback after delay
      if (onComplete && failed.length === 0) {
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      }

    } catch (error) {
      toast({
        title: 'Bulk əməliyyat xətası',
        description: error instanceof Error ? error.message : 'Naməlum xəta',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setSelectedColumnId('');
    setBulkValue('');
    setSubmissionResults(null);
    onClose();
  };

  // Render column input based on type
  const renderColumnInput = () => {
    if (!selectedColumn) return null;

    switch (selectedColumn.type) {
      case 'select':
        return (
          <Select value={bulkValue} onValueChange={setBulkValue}>
            <SelectTrigger>
              <SelectValue placeholder="Seçin..." />
            </SelectTrigger>
            <SelectContent>
              {(selectedColumn.options as any[])?.map((option: any, index: number) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            placeholder={selectedColumn.placeholder || `${selectedColumn.name} daxil edin`}
            className="min-h-[100px]"
          />
        );
      
      default:
        return (
          <Input
            type={
              selectedColumn.type === 'number' ? 'number' :
              selectedColumn.type === 'date' ? 'date' :
              selectedColumn.type === 'email' ? 'email' :
              'text'
            }
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            placeholder={selectedColumn.placeholder || `${selectedColumn.name} daxil edin`}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Toplu Məlumat Daxil Etmə
          </DialogTitle>
          <DialogDescription>
            Seçilmiş məktəblər üçün eyni məlumatı toplu şəkildə daxil edin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Schools Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Seçilmiş Məktəblər ({selectedSchools.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Məktəblər yüklənir...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {schools?.map((school) => (
                    <div key={school.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                      <span className="truncate">{school.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Kateqoriya</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Kateqoriya yüklənir...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category?.name}</span>
                  <Badge variant="outline">
                    {columns.length} sütun
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Sütun Seçimi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Hansı sütuna məlumat daxil edəcəksiniz?</label>
                <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Sütun seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        <div className="flex items-center gap-2">
                          <span>{column.name}</span>
                          {column.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Məcburi
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {column.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedColumn && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    Dəyər
                    {selectedColumn.is_required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-2">
                    {renderColumnInput()}
                  </div>
                  {selectedColumn.help_text && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedColumn.help_text}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {selectedColumn && bulkValue && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Önizləmə:</p>
                  <p className="text-sm">
                    <strong>{selectedSchools.length}</strong> məktəb üçün{' '}
                    <strong>"{selectedColumn.name}"</strong> sütununa{' '}
                    <strong>"{bulkValue}"</strong> dəyəri daxil ediləcək.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bu əməliyyat geri alına bilməz. Təsdiq etmədən əvvəl yoxlayın.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submission Results */}
          {submissionResults && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {submissionResults.failed.length === 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  Nəticələr
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success */}
                {submissionResults.successful.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Uğurlu ({submissionResults.successful.length})
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Məlumatlar avtomatik təsdiq edildi və bildirişlər göndərildi
                    </div>
                  </div>
                )}

                {/* Failures */}
                {submissionResults.failed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                      <X className="h-4 w-4" />
                      Xətələr ({submissionResults.failed.length})
                    </div>
                    <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                      {submissionResults.failed.map(({ schoolId, error }) => {
                        const school = schools?.find(s => s.id === schoolId);
                        return (
                          <div key={schoolId} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                            <span className="font-medium">{school?.name || schoolId}:</span> {error}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Tamamlanma</span>
                    <span>
                      {submissionResults.successful.length}/{selectedSchools.length}
                    </span>
                  </div>
                  <Progress 
                    value={(submissionResults.successful.length / selectedSchools.length) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {submissionResults ? 'Bağla' : 'Ləğv et'}
          </Button>
          
          {!submissionResults && (
            <Button
              onClick={handleBulkSubmit}
              disabled={
                isSubmitting || 
                !selectedColumnId || 
                !bulkValue.trim() || 
                selectedSchools.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Göndərilir...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Toplu Göndər ({selectedSchools.length} məktəb)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkDataEntryDialog;
