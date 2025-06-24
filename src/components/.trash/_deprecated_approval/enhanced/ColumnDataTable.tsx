import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Minus,
  Filter,
  Info,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDataEntry, ValidationResult } from '@/services/approval/dataReviewService';
import { useTranslation } from '@/contexts/TranslationContext';

interface ColumnDataTableProps {
  columns: ColumnDataEntry[];
  validationResults?: ValidationResult[];
  isLoading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showValidationSummary?: boolean;
  className?: string;
  onColumnSelect?: (columnId: string) => void;
}

type SortField = 'name' | 'type' | 'required' | 'status' | 'order';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'valid' | 'invalid' | 'warning' | 'empty';
type RequiredFilter = 'all' | 'required' | 'optional';

export const ColumnDataTable: React.FC<ColumnDataTableProps> = ({
  columns,
  validationResults = [],
  isLoading = false,
  showSearch = true,
  showFilters = true,
  showValidationSummary = true,
  className,
  onColumnSelect
}) => {
  const { t } = useTranslation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [requiredFilter, setRequiredFilter] = useState<RequiredFilter>('all');
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get validation status for a column
  const getValidationStatus = (columnId: string): {
    status: string;
    message?: string;
    severity?: string;
  } => {
    const validation = validationResults.find(v => v.columnId === columnId);
    if (validation) {
      return {
        status: validation.status,
        message: validation.message,
        severity: validation.severity
      };
    }
    
    const column = columns.find(c => c.columnId === columnId);
    return {
      status: column?.validationStatus || 'valid'
    };
  };

  // Status icon component
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'empty':
        return <Minus className="h-4 w-4 text-gray-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    const configs = {
      valid: { variant: 'default' as const, text: 'Düzgün' },
      invalid: { variant: 'destructive' as const, text: 'Xəta' },
      warning: { variant: 'secondary' as const, text: 'Xəbərdarlıq' },
      empty: { variant: 'outline' as const, text: 'Boş' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.empty;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.text}
      </Badge>
    );
  };

  // Column type badge
  const getTypeBadge = (type: string) => {
    const typeColors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      select: 'bg-orange-100 text-orange-800',
      checkbox: 'bg-pink-100 text-pink-800',
      radio: 'bg-indigo-100 text-indigo-800',
      email: 'bg-cyan-100 text-cyan-800',
      url: 'bg-teal-100 text-teal-800',
      file: 'bg-gray-100 text-gray-800'
    };
    
    const colorClass = typeColors[type as keyof typeof typeColors] || typeColors.text;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {type}
      </span>
    );
  };

  // Filter and sort data
  const filteredAndSortedColumns = useMemo(() => {
    let filtered = columns.filter(column => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = column.columnName.toLowerCase().includes(searchLower);
        const matchesValue = column.formattedValue.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesValue) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        const validation = getValidationStatus(column.columnId);
        if (validation.status !== statusFilter) return false;
      }
      
      // Required filter
      if (requiredFilter !== 'all') {
        if (requiredFilter === 'required' && !column.isRequired) return false;
        if (requiredFilter === 'optional' && column.isRequired) return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.columnName.toLowerCase();
          bValue = b.columnName.toLowerCase();
          break;
        case 'type':
          aValue = a.columnType;
          bValue = b.columnType;
          break;
        case 'required':
          aValue = a.isRequired ? 1 : 0;
          bValue = b.isRequired ? 1 : 0;
          break;
        case 'status':
          aValue = getValidationStatus(a.columnId).status;
          bValue = getValidationStatus(b.columnId).status;
          break;
        case 'order':
        default:
          aValue = a.orderIndex || 0;
          bValue = b.orderIndex || 0;
          break;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [columns, searchTerm, statusFilter, requiredFilter, sortField, sortDirection, validationResults]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Validation summary
  const validationSummary = useMemo(() => {
    const summary = {
      total: columns.length,
      valid: 0,
      invalid: 0,
      warning: 0,
      empty: 0,
      filled: 0,
      required: columns.filter(c => c.isRequired).length,
      requiredFilled: 0
    };

    columns.forEach(column => {
      const status = getValidationStatus(column.columnId).status;
      summary[status as keyof typeof summary]++;
      
      if (column.value !== null && column.value !== undefined && column.value !== '') {
        summary.filled++;
        if (column.isRequired) {
          summary.requiredFilled++;
        }
      }
    });

    return summary;
  }, [columns, validationResults]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (columns.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Sütun məlumatı tapılmadı</p>
          <p className="text-sm text-muted-foreground">
            Bu kateqoriya üçün heç bir sütun konfiqurasiya edilməyib
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Validation Summary */}
      {showValidationSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{validationSummary.filled}</div>
              <div className="text-sm text-muted-foreground">
                Doldurulub / {validationSummary.total}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{validationSummary.valid}</div>
              <div className="text-sm text-muted-foreground">Düzgün</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{validationSummary.invalid}</div>
              <div className="text-sm text-muted-foreground">Xətalı</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {validationSummary.requiredFilled} / {validationSummary.required}
              </div>
              <div className="text-sm text-muted-foreground">Məcburi sahələr</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrlər və Axtarış
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sütun adı və ya dəyərinə görə axtarın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün statuslar</SelectItem>
                      <SelectItem value="valid">Düzgün</SelectItem>
                      <SelectItem value="invalid">Xətalı</SelectItem>
                      <SelectItem value="warning">Xəbərdarlıq</SelectItem>
                      <SelectItem value="empty">Boş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Məcburilik</label>
                  <Select value={requiredFilter} onValueChange={(value: RequiredFilter) => setRequiredFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Bütün sahələr</SelectItem>
                      <SelectItem value="required">Yalnız məcburi</SelectItem>
                      <SelectItem value="optional">Yalnız ixtiyari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sütun Məlumatları ({filteredAndSortedColumns.length} / {columns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-medium"
                    >
                      Sütun Adı
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                        <SortAsc className="ml-2 h-4 w-4" /> : 
                        <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('type')}
                      className="h-auto p-0 font-medium"
                    >
                      Tip
                      {sortField === 'type' && (
                        sortDirection === 'asc' ? 
                        <SortAsc className="ml-2 h-4 w-4" /> : 
                        <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Dəyər</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('required')}
                      className="h-auto p-0 font-medium"
                    >
                      Məcburi
                      {sortField === 'required' && (
                        sortDirection === 'asc' ? 
                        <SortAsc className="ml-2 h-4 w-4" /> : 
                        <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-auto p-0 font-medium"
                    >
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? 
                        <SortAsc className="ml-2 h-4 w-4" /> : 
                        <SortDesc className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedColumns.map((column) => {
                  const validation = getValidationStatus(column.columnId);
                  
                  return (
                    <TableRow 
                      key={column.columnId}
                      className={`
                        ${validation.status === 'invalid' ? 'bg-red-50 hover:bg-red-100' : ''}
                        ${validation.status === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                        ${onColumnSelect ? 'cursor-pointer' : ''}
                      `}
                      onClick={() => onColumnSelect?.(column.columnId)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{column.columnName}</div>
                          {column.helpText && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {column.helpText}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getTypeBadge(column.columnType)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium break-words">
                            {column.formattedValue}
                          </div>
                          {column.placeholder && !column.value && (
                            <div className="text-xs text-muted-foreground italic mt-1">
                              Placeholder: {column.placeholder}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {column.isRequired ? (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Məcburi
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            İxtiyari
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(validation.status)}
                          {validation.message && (
                            <div className="text-xs text-muted-foreground">
                              {validation.message}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedColumns.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Heç bir nəticə tapılmadı</p>
              <p className="text-sm text-muted-foreground">
                Filtrlər və ya axtarış şərtlərini dəyişməyi sınayın
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors Summary */}
      {validationResults.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Validation nəticələri:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationResults.filter(r => r.severity === 'error').map((result, index) => (
                  <li key={index} className="text-red-600">
                    <strong>{result.columnName}:</strong> {result.message}
                  </li>
                ))}
                {validationResults.filter(r => r.severity === 'warning').map((result, index) => (
                  <li key={index} className="text-yellow-600">
                    <strong>{result.columnName}:</strong> {result.message}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ColumnDataTable;