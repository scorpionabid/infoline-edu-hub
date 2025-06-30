
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
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Category, Column, SchoolDataEntry, DataStats, DataManagementPermissions } from '@/hooks/dataManagement/useDataManagement';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [processingSchool, setProcessingSchool] = useState<string | null>(null);

  // Check if user is sector admin
  const isSectorAdmin = !permissions.canEdit; // Sector admins can't edit but can approve

  const handleStartEdit = (schoolId: string, currentValue: string) => {
    // SECTOR ADMIN RESTRICTION: Cannot edit data
    if (isSectorAdmin) {
      toast.error('Sektoradmin məktəblər adından məlumat daxil edə bilməz');
      return;
    }
    
    setEditingSchool(schoolId);
    setEditValue(currentValue || '');
  };

  const handleSaveEdit = async () => {
    if (!editingSchool) return;
    
    // SECTOR ADMIN RESTRICTION: Cannot save data
    if (isSectorAdmin) {
      toast.error('Sektoradmin məktəblər adından məlumat daxil edə bilməz');
      return;
    }
    
    try {
      const success = await onDataSave(editingSchool, editValue);
      if (success) {
        setEditingSchool(null);
        setEditValue('');
        toast.success('Məlumat saxlanıldı');
      } else {
        toast.error('Məlumat saxlanarkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Məlumat saxlanarkən xəta baş verdi');
    }
  };

  const handleCancelEdit = () => {
    setEditingSchool(null);
    setEditValue('');
  };

  const handleApprove = async (schoolId: string) => {
    setProcessingSchool(schoolId);
    try {
      const success = await onDataApprove(schoolId);
      if (success) {
        toast.success(`${column.name} sütunu üçün məlumat təsdiqləndi`);
      } else {
        toast.error('Təsdiq zamanı xəta baş verdi');
      }
    } catch (error) {
      console.error('Approve failed:', error);
      toast.error('Təsdiq zamanı xəta baş verdi');
    } finally {
      setProcessingSchool(null);
    }
  };

  const handleReject = async (schoolId: string, reason: string) => {
    setProcessingSchool(schoolId);
    try {
      const success = await onDataReject(schoolId, reason);
      if (success) {
        toast.success(`${column.name} sütunu üçün məlumat rədd edildi`);
      } else {
        toast.error('Rədd etmə zamanı xəta baş verdi');
      }
    } catch (error) {
      console.error('Reject failed:', error);
      toast.error('Rədd etmə zamanı xəta baş verdi');
    } finally {
      setProcessingSchool(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      'approved': { 
        variant: 'default' as const, 
        label: 'Təsdiqlənmiş', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2
      },
      'pending': { 
        variant: 'secondary' as const, 
        label: 'Gözləmədə', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle
      },
      'rejected': { 
        variant: 'destructive' as const, 
        label: 'Rədd edilmiş', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      },
      'empty': { 
        variant: 'outline' as const, 
        label: 'Boş', 
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: AlertCircle
      }
    };
    
    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className={cn(statusConfig.className, "flex items-center gap-1")}>
        <Icon className="h-3 w-3" />
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
          Geri
        </Button>
        <div>
          <h3 className="text-2xl font-bold">Sütun-səviyyəli Məlumat İdarəetməsi</h3>
          <p className="text-muted-foreground">
            {category.name} • <span className="font-semibold text-blue-600">{column.name}</span>
          </p>
        </div>
      </div>

      {/* Enhanced Category and Column Info */}
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
                <div className="font-medium flex items-center gap-2">
                  {column.name}
                  <Badge variant="outline">{column.type}</Badge>
                  {column.is_required && (
                    <Badge variant="destructive" className="text-xs">Məcburi</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sütun-səviyyəli təsdiq aktiv
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTOR ADMIN WARNING */}
      {isSectorAdmin && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Sektoradmin məhdudiyyəti:</strong> Siz yalnız məktəblər tərəfindən daxil edilmiş məlumatları təsdiq və ya rədd edə bilərsiniz. Məktəblər adından məlumat daxil edə bilməzsiniz.
          </AlertDescription>
        </Alert>
      )}

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
              <span>
                Məktəb Məlumatları - <span className="text-blue-600">{column.name}</span> Sütunu
              </span>
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
                  <TableHead>{column.name}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolData.map((school) => (
                  <TableRow key={school.id} className={processingSchool === school.school_id ? 'opacity-50' : ''}>
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
                          className={`cursor-pointer hover:bg-muted p-2 rounded ${
                            isSectorAdmin ? 'cursor-not-allowed opacity-60' : ''
                          }`}
                          onClick={() => handleStartEdit(school.school_id, school.value || '')}
                          title={isSectorAdmin ? 'Sektoradmin məlumat daxil edə bilməz' : 'Məlumat daxil etmək üçün klikləyin'}
                        >
                          {school.value || (
                            <span className="text-muted-foreground italic">
                              {isSectorAdmin ? 'Məktəb tərəfindən doldurulmalıdır' : 'Məlumat daxil edin'}
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
                              className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(school.school_id)}
                              disabled={processingSchool === school.school_id}
                            >
                              {processingSchool === school.school_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(school.school_id, 'Məlumat düzgün deyil')}
                              disabled={processingSchool === school.school_id}
                            >
                              {processingSchool === school.school_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
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

      {/* Enhanced Help Text */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Sütun-səviyyəli təsdiq sistemi:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Yalnız <strong>{column.name}</strong> sütunundakı məlumatlar təsdiqlənəcək</li>
              <li>• Digər sütunlardakı məlumatlar təsirlənməyəcək</li>
              <li>• Hər sütun üçün ayrı-ayrı təsdiq tələb olunur</li>
              {isSectorAdmin && (
                <li className="text-orange-600">• <strong>Sektoradmin məhdudiyyəti:</strong> Məktəblər adından məlumat daxil edilə bilməz</li>
              )}
            </ul>
            {column.help_text && (
              <p className="text-sm mt-2 p-2 bg-muted rounded">
                <strong>Sütun haqqında:</strong> {column.help_text}
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
});

SchoolDataGrid.displayName = 'SchoolDataGrid';

export default SchoolDataGrid;
