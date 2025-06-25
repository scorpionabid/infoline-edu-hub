import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Clock, 
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Edit3,
  Eye,
  FileText,
  Hash,
  Type,
  Calendar as CalendarIcon,
  CheckSquare,
  List
} from 'lucide-react';
import { ColumnStatus } from '@/hooks/dashboard/useDashboardData';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ColumnStatusGridProps {
  columns: ColumnStatus[];
  onColumnClick: (categoryId: string, columnId: string) => void;
  groupBy?: 'category' | 'status' | 'type' | 'none';
  showFilter?: boolean;
  loading?: boolean;
  className?: string;
}

// Status konfiqurasiyası
const getStatusConfig = (status: ColumnStatus['status']) => {
  switch (status) {
    case 'approved':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        badge: 'bg-green-100 text-green-800 border-green-200',
        label: 'Təsdiqləndi'
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Gözləyir'
      };
    case 'rejected':
      return {
        icon: XCircle,
        color: 'text-red-600',
        badge: 'bg-red-100 text-red-800 border-red-200',
        label: 'Rədd edildi'
      };
    case 'draft':
    default:
      return {
        icon: FileText,
        color: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-600 border-gray-200',
        label: 'Layihə'
      };
  }
};

// Sütun tipi ikonu
const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'text':
      return Type;
    case 'number':
      return Hash;
    case 'date':
      return CalendarIcon;
    case 'select':
    case 'radio':
      return List;
    case 'checkbox':
      return CheckSquare;
    default:
      return FileText;
  }
};

// Dəyər formatı
const formatValue = (value: any, type: string) => {
  if (!value && value !== 0) return '-';
  
  switch (type.toLowerCase()) {
    case 'date':
      try {
        return formatDate(new Date(value));
      } catch {
        return value;
      }
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    case 'checkbox':
      return value === true || value === 'true' ? 'Bəli' : 'Xeyr';
    default:
      return String(value).length > 50 ? `${String(value).slice(0, 47)}...` : String(value);
  }
};

// Əsas komponent
export const ColumnStatusGrid: React.FC<ColumnStatusGridProps> = ({
  columns,
  onColumnClick,
  groupBy = 'none',
  showFilter = true,
  loading = false,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter və search məntiqini tətbiq edirik
  const filteredColumns = useMemo(() => {
    let filtered = [...columns];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(col => 
        col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (col.value && String(col.value).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(col => col.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(col => col.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(col => col.categoryId === categoryFilter);
    }

    return filtered;
  }, [columns, searchTerm, statusFilter, typeFilter, categoryFilter]);

  // Qruplama məntiqini tətbiq edirik
  const groupedColumns = useMemo(() => {
    if (groupBy === 'none') {
      return { 'Bütün sütunlar': filteredColumns };
    }

    const groups: Record<string, ColumnStatus[]> = {};

    filteredColumns.forEach(column => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'category':
          groupKey = column.categoryName;
          break;
        case 'status':
          groupKey = getStatusConfig(column.status).label;
          break;
        case 'type':
          groupKey = column.type.charAt(0).toUpperCase() + column.type.slice(1);
          break;
        default:
          groupKey = 'Digər';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(column);
    });

    return groups;
  }, [filteredColumns, groupBy]);

  // Unikal dəyərlər (filter üçün)
  const uniqueCategories = useMemo(() => {
    const categoryMap = new Map();
    columns.forEach(col => {
      if (!categoryMap.has(col.categoryId)) {
        categoryMap.set(col.categoryId, { id: col.categoryId, name: col.categoryName });
      }
    });
    return Array.from(categoryMap.values());
  }, [columns]);

  const uniqueTypes = useMemo(() => 
    Array.from(new Set(columns.map(col => col.type)))
  , [columns]);

  const uniqueStatuses = useMemo(() => 
    Array.from(new Set(columns.map(col => col.status)))
  , [columns]);

  // Click handler
  const handleColumnClick = (column: ColumnStatus) => {
    onColumnClick(column.categoryId, column.id);
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!columns || columns.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Sütun tapılmadı
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Hələ ki, heç bir sütun məlumatı yoxdur.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5" />
            <CardTitle>Sütun Status Cədvəli</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredColumns.length} / {columns.length} sütun
          </div>
        </div>
        
        {/* Filter Section */}
        {showFilter && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Sütun adı və ya dəyərinə görə axtarın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Group By */}
              <Select value={groupBy} onValueChange={() => {}}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Qrupsuz</SelectItem>
                  <SelectItem value="category">Kateqoriya</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Tip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün statuslar</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={`status-${status}`} value={status}>
                      {getStatusConfig(status).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün tiplər</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={`type-${type}`} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kateqoriya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün kateqoriyalar</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={`category-${category.id}`} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedColumns).map(([groupName, groupColumns]) => (
            <div key={`group-${groupBy}-${groupName}`}>
              {groupBy !== 'none' && (
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {groupName} ({groupColumns.length})
                </h3>
              )}
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Sütun</TableHead>
                      <TableHead className="w-[150px]">Kateqoriya</TableHead>
                      <TableHead className="w-[100px]">Tip</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[200px]">Dəyər</TableHead>
                      <TableHead className="w-[120px]">Son Yeniləmə</TableHead>
                      <TableHead className="w-[100px]">Əməliyyat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupColumns.map((column) => {
                      const statusConfig = getStatusConfig(column.status);
                      const TypeIcon = getTypeIcon(column.type);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <TableRow 
                          key={column.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleColumnClick(column)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{column.name}</div>
                                {column.isRequired && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Məcburi
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {column.categoryName}
                            </span>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {column.type}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
                              <Badge variant="outline" className={cn("text-xs", statusConfig.badge)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="max-w-[180px]">
                              {column.isFilled ? (
                                <span className="text-sm">
                                  {formatValue(column.value, column.type)}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  Doldurulmayıb
                                </span>
                              )}
                              {column.rejectionReason && (
                                <div className="text-xs text-red-600 mt-1" title={column.rejectionReason}>
                                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                                  Rədd səbəbi var
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {column.lastUpdated ? (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(column.lastUpdated)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColumnClick(column);
                              }}
                            >
                              {column.isFilled ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <Edit3 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Ümumi</div>
              <div className="font-medium">{filteredColumns.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Doldurulmuş</div>
              <div className="font-medium text-green-600">
                {filteredColumns.filter(col => col.isFilled).length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Məcburi</div>
              <div className="font-medium text-orange-600">
                {filteredColumns.filter(col => col.isRequired).length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Təsdiqlənmiş</div>
              <div className="font-medium text-blue-600">
                {filteredColumns.filter(col => col.status === 'approved').length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnStatusGrid;