
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  Save, 
  Loader2, 
  Building, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';
import type { Category, Column } from '@/types/column';
import type { SchoolDataEntry, DataManagementPermissions } from '@/hooks/dataManagement/useDataManagement';

interface SchoolDataGridProps {
  category: Category;
  column: Column;
  schoolData: SchoolDataEntry[];
  permissions: DataManagementPermissions;
  loading?: boolean;
  saving?: boolean;
  onDataSave: (schoolId: string, value: string) => Promise<boolean>;
  onDataApprove: (schoolId: string, comment?: string) => Promise<boolean>;
  onDataReject: (schoolId: string, reason: string, comment?: string) => Promise<boolean>;
  onBulkApprove: (schoolIds: string[]) => Promise<boolean>;
  onBulkReject: (schoolIds: string[], reason: string) => Promise<boolean>;
}

/**
 * School Data Grid Component
 * 
 * Displays school data for a specific category and column with inline editing,
 * approval/rejection actions, and bulk operations.
 * 
 * Features:
 * - Column-level approval system (fixed)
 * - SectorAdmin can edit on behalf of schools (restored)
 * - Inline data entry with auto-save
 * - Individual and bulk approval/rejection
 * - Status indicators and progress tracking
 * - Responsive design for mobile devices
 */
export const SchoolDataGrid: React.FC<SchoolDataGridProps> = ({
  category,
  column,
  schoolData,
  permissions,
  loading = false,
  saving = false,
  onDataSave,
  onDataApprove,
  onDataReject,
  onBulkApprove,
  onBulkReject
}) => {
  const { t } = useTranslation();
  
  // Local state
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [editingSchool, setEditingSchool] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Handle school selection for bulk operations
  const handleSchoolSelect = (schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchools(prev => [...prev, schoolId]);
    } else {
      setSelectedSchools(prev => prev.filter(id => id !== schoolId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchools(schoolData.map(school => school.school_id));
    } else {
      setSelectedSchools([]);
    }
  };

  // Start editing a school's data
  const handleStartEdit = (schoolId: string, currentValue: string) => {
    setEditingSchool(schoolId);
    setEditValue(currentValue);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSchool(null);
    setEditValue('');
  };

  // Save data for a school
  const handleSaveData = async (schoolId: string) => {
    if (!editValue.trim() && column.is_required) {
      toast.error('Bu sütun məcburidir');
      return;
    }

    setActionLoading(schoolId);
    try {
      const success = await onDataSave(schoolId, editValue);
      if (success) {
        toast.success('Məlumat uğurla saxlanıldı');
        setEditingSchool(null);
        setEditValue('');
      } else {
        toast.error('Məlumat saxlanarkən xəta baş verdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Approve data for a school
  const handleApprove = async (schoolId: string) => {
    setActionLoading(schoolId);
    try {
      const success = await onDataApprove(schoolId);
      if (success) {
        toast.success(`${column.name} sütunu üçün məlumat təsdiqləndi`);
      } else {
        toast.error('Təsdiq zamanı xəta baş verdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Reject data for a school
  const handleReject = async (schoolId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Rədd səbəbi daxil edilməlidir');
      return;
    }

    setActionLoading(schoolId);
    try {
      const success = await onDataReject(schoolId, rejectReason);
      if (success) {
        toast.success(`${column.name} sütunu üçün məlumat rədd edildi`);
        setShowRejectDialog(null);
        setRejectReason('');
      } else {
        toast.error('Rədd zamanı xəta baş verdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk approve selected schools
  const handleBulkApprove = async () => {
    if (selectedSchools.length === 0) {
      toast.error('Heç bir məktəb seçilməyib');
      return;
    }

    setActionLoading('bulk');
    try {
      const success = await onBulkApprove(selectedSchools);
      if (success) {
        toast.success(`${selectedSchools.length} məktəbin ${column.name} sütunu təsdiqləndi`);
        setSelectedSchools([]);
      } else {
        toast.error('Toplu təsdiq zamanı xəta baş verdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk reject selected schools
  const handleBulkReject = async () => {
    if (selectedSchools.length === 0) {
      toast.error('Heç bir məktəb seçilməyib');
      return;
    }

    if (!rejectReason.trim()) {
      toast.error('Rədd səbəbi daxil edilməlidir');
      return;
    }

    setActionLoading('bulk');
    try {
      const success = await onBulkReject(selectedSchools, rejectReason);
      if (success) {
        toast.success(`${selectedSchools.length} məktəbin ${column.name} sütunu rədd edildi`);
        setSelectedSchools([]);
        setRejectReason('');
      } else {
        toast.error('Toplu rədd zamanı xəta baş verdi');
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Render input field based on column type
  const renderInputField = (value: string, onChange: (value: string) => void, disabled: boolean = false) => {
    const commonProps = {
      disabled: disabled || saving,
      className: "w-full"
    };

    if (column.type === 'textarea') {
      return (
        <Textarea
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          {...commonProps}
        />
      );
    } else if (column.type === 'select' && column.options && Array.isArray(column.options) && column.options.length > 0) {
      return (
        <Select 
          value={value} 
          onValueChange={onChange} 
          disabled={commonProps.disabled}
        >
          <SelectTrigger className={commonProps.className}>
            <SelectValue placeholder="Seçim edin..." />
          </SelectTrigger>
          <SelectContent>
            {(column.options || []).map((option: any, index: number) => {
              const optionValue = option.value || option;
              const optionLabel = option.label || option.value || option;
              return (
                <SelectItem key={`${optionValue}-${index}`} value={String(optionValue)}>
                  {String(optionLabel)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          type={column.type === 'number' ? 'number' : 'text'}
          placeholder={column.placeholder || 'Məlumatı daxil edin...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...commonProps}
        />
      );
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          label: 'Təsdiqlənmiş',
          className: 'bg-green-100 text-green-800',
          variant: 'secondary' as const
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Gözləyir',
          className: 'bg-yellow-100 text-yellow-800', 
          variant: 'secondary' as const
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rədd edilmiş',
          className: 'bg-red-100 text-red-800',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Boş',
          className: 'bg-gray-100 text-gray-800',
          variant: 'outline' as const
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Məktəb məlumatları yüklənir...</span>
        </div>
      </div>
    );
  }

  if (schoolData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Məktəb tapılmadı</h3>
          <p className="text-muted-foreground">
            Bu sütun üçün heç bir məktəb məlumatı tapılmadı.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Column-level approval info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <div className="font-medium">Sütun-səviyyəli təsdiq sistemi aktiv</div>
          <div className="text-sm">
            • Yalnız <strong>{column.name}</strong> sütunu üçün məlumatlar təsdiqlənəcək<br/>
            • Digər sütunlar təsirlənməyəcək<br/>
            • Hər sütun üçün ayrı-ayrı təsdiq tələb olunur
          </div>
        </AlertDescription>
      </Alert>

      {/* Bulk Actions */}
      {permissions.canApprove && selectedSchools.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedSchools.length} məktəb seçilib
                </span>
                <Badge variant="outline" className="text-xs">
                  {column.name} sütunu
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={actionLoading === 'bulk'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Hamısını Təsdiqlə
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={actionLoading === 'bulk' || !rejectReason.trim()}
                >
                  {actionLoading === 'bulk' ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Hamısını Rədd Et
                </Button>
              </div>
            </div>
            
            {selectedSchools.length > 0 && (
              <div className="mt-3">
                <Input
                  placeholder="Rədd səbəbini daxil edin (toplu rədd üçün)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schools Data Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              {category.name} - {column.name}
              {column.is_required && (
                <Badge variant="destructive" className="text-xs">
                  Məcburi
                </Badge>
              )}
            </CardTitle>
            
            {permissions.canApprove && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSchools.length === schoolData.length && schoolData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Hamısını seç</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y">
            {schoolData.map((school) => {
              const statusConfig = getStatusBadge(school.status);
              const StatusIcon = statusConfig.icon;
              const isEditing = editingSchool === school.school_id;
              const isLoading = actionLoading === school.school_id;
              
              return (
                <div key={school.school_id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    {permissions.canApprove && (
                      <Checkbox
                        checked={selectedSchools.includes(school.school_id)}
                        onCheckedChange={(checked) => handleSchoolSelect(school.school_id, Boolean(checked))}
                      />
                    )}
                    
                    {/* School Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{school.school_name}</h4>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      {/* Data Input/Display */}
                      <div className="space-y-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            {renderInputField(editValue, setEditValue)}
                            <Button
                              size="sm"
                              onClick={() => handleSaveData(school.school_id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={isLoading}
                            >
                              Ləğv
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="text-sm p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => permissions.canEdit && handleStartEdit(school.school_id, school.value)}
                          >
                            {school.value || (
                              <span className="text-muted-foreground italic">
                                Məlumat daxil etmək üçün klikləyin
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {permissions.canApprove && !isEditing && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(school.school_id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setShowRejectDialog(school.school_id)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Individual Reject Dialog */}
                  {showRejectDialog === school.school_id && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-red-800">
                          Rədd səbəbi (məcburi):
                        </label>
                        <Textarea
                          placeholder="Məlumatların rədd edilmə səbəbini qeyd edin..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowRejectDialog(null);
                              setRejectReason('');
                            }}
                          >
                            Ləğv et
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(school.school_id)}
                            disabled={!rejectReason.trim() || isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />  
                            )}
                            Rədd et
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
