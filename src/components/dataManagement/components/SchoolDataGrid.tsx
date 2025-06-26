
import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft,
  Save,
  Check,
  X,
  Loader2,
  AlertCircle,
  Building2,
  // Users
} from 'lucide-react';
import { Category, Column, SchoolDataEntry, DataStats, DataManagementPermissions } from '@/hooks/dataManagement/useDataManagement';

interface SchoolDataGridProps {
  category: Category;
  column: Column;
  schoolData: SchoolDataEntry[];
  stats: DataStats;
  loading: boolean;
  saving: boolean;
  permissions: DataManagementPermissions;
  onDataSave: (schoolId: string, value: string) => Promise<boolean>;
  onDataApprove: (schoolId: string, comment?: string) => Promise<boolean>;
  onDataReject: (schoolId: string, reason: string, comment?: string) => Promise<boolean>;
  onBulkApprove: (schoolIds: string[]) => Promise<boolean>;
  onBulkReject: (schoolIds: string[], reason: string) => Promise<boolean>;
  onBack: () => void;
  compactMode?: boolean;
}

export const SchoolDataGrid: React.FC<SchoolDataGridProps> = memo(({
  category,
  column,
  schoolData,
  stats,
  loading,
  saving,
  permissions,
  onDataSave,
  onDataApprove,
  onDataReject,
  onBulkApprove,
  onBulkReject,
  onBack,
  compactMode = false
}) => {
  const [editingSchool, setEditingSchool] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const handleStartEdit = (schoolId: string, currentValue: string) => {
    setEditingSchool(schoolId);
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!editingSchool) return;
    
    try {
      await onDataSave(editingSchool, editValue);
      setEditingSchool(null);
      setEditValue('');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSchool(null);
    setEditValue('');
  };

  const handleApprove = async (schoolId: string) => {
    try {
      await onDataApprove(schoolId);
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  const handleReject = async (schoolId: string, reason: string) => {
    try {
      await onDataReject(schoolId, reason);
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'approved': { variant: 'default' as const, label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-800' },
      'pending': { variant: 'secondary' as const, label: 'Gözləmədə', className: 'bg-yellow-100 text-yellow-800' },
      'rejected': { variant: 'destructive' as const, label: 'Rədd edilmiş', className: 'bg-red-100 text-red-800' },
      'empty': { variant: 'outline' as const, label: 'Boş', className: 'bg-gray-100 text-gray-600' }
    };
    
    const statusConfig = config[status] || config.pending;
    
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          // Geri
        </Button>
        <div>
          <h3 className="text-2xl font-bold">Məlumat İdarəetməsi</h3>
          <p className="text-muted-foreground">
            {category.name} • {column.name}
          </p>
        </div>
      </div>

      {/* Category and Column Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-muted-foreground">
                  {category.assignment === 'sectors' ? 'Sektor Məlumatı' : 'Məktəb Məlumatları'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">{column.name}</div>
                <div className="text-sm text-muted-foreground">
                  {column.type} • {column.is_required ? 'Məcburi' : 'İxtiyari'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalSchools || 0}</div>
            <div className="text-sm text-muted-foreground">Ümumi Məktəb</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount || 0}</div>
            <div className="text-sm text-muted-foreground">Gözləyən</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approvedCount || 0}</div>
            <div className="text-sm text-muted-foreground">Təsdiqlənmiş</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate || 0}%</div>
            <div className="text-sm text-muted-foreground">Tamamlanma</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      {schoolData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Məlumat tapılmadı</h3>
            <p className="text-muted-foreground">
              Bu kateqoriya və sütun üçün heç bir məktəb məlumatı tapılmadı
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Məktəb Məlumatları</span>
              {saving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yadda saxlanır...
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Məktəb Adı</TableHead>
                  <TableHead>Məlumat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolData.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">
                      {school.school_name}
                    </TableCell>
                    <TableCell>
                      {editingSchool === school.school_id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={column.placeholder || `${column.name} daxil edin`}
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-muted p-2 rounded"
                          onClick={() => handleStartEdit(school.school_id, school.value || '')}
                        >
                          {school.value || (
                            <span className="text-muted-foreground italic">
                              Məlumat daxil edin
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(school.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {permissions.canApprove && school.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(school.school_id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(school.school_id, 'Məlumat düzgün deyil')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {column.help_text && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {column.help_text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
