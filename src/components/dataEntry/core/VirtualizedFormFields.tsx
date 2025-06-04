
import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { FieldRenderer } from '@/components/dataEntry/fields/FieldRenderer';
import { Column } from '@/types/column';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VirtualizedFormFieldsProps {
  columns: Column[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  readOnly?: boolean;
  errors?: Record<string, string>;
  className?: string;
  virtualizationThreshold?: number;
  itemHeight?: number;
  maxHeight?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  groupByCategory?: boolean;
}

interface FieldGroup {
  id: string;
  name: string;
  fields: Column[];
  isCollapsed?: boolean;
}

interface FilterState {
  search: string;
  showRequired: boolean;
  showOptional: boolean;
  showFilled: boolean;
  showEmpty: boolean;
  fieldTypes: string[];
}

const VirtualizedFormFields: React.FC<VirtualizedFormFieldsProps> = ({
  columns,
  formData,
  onFieldChange,
  readOnly = false,
  errors = {},
  className = '',
  virtualizationThreshold = 20,
  itemHeight = 80,
  maxHeight = 600,
  showSearch = true,
  showFilters = false,
  groupByCategory = false
}) => {
  const { t } = useLanguage();
  const listRef = useRef<List>(null);
  
  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    showRequired: true,
    showOptional: true,
    showFilled: true,
    showEmpty: true,
    fieldTypes: []
  });
  
  // Collapsed groups state (for grouping mode)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Memoized filtered and sorted columns
  const processedColumns = useMemo(() => {
    let filtered = columns;

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(column =>
        column.name.toLowerCase().includes(searchTerm) ||
        (column.help_text && column.help_text.toLowerCase().includes(searchTerm))
      );
    }

    // Apply field type filters
    if (filters.fieldTypes.length > 0) {
      filtered = filtered.filter(column =>
        filters.fieldTypes.includes(column.type)
      );
    }

    // Apply required/optional filters
    filtered = filtered.filter(column => {
      if (!filters.showRequired && column.is_required) return false;
      if (!filters.showOptional && !column.is_required) return false;
      return true;
    });

    // Apply filled/empty filters
    filtered = filtered.filter(column => {
      const hasValue = formData[column.id] !== undefined && 
                      formData[column.id] !== null && 
                      formData[column.id] !== '';
      if (!filters.showFilled && hasValue) return false;
      if (!filters.showEmpty && !hasValue) return false;
      return true;
    });

    // Sort by required first, then alphabetically
    return filtered.sort((a, b) => {
      if (a.is_required && !b.is_required) return -1;
      if (!a.is_required && b.is_required) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [columns, filters, formData]);

  // Group columns if groupByCategory is enabled
  const fieldGroups = useMemo((): FieldGroup[] => {
    if (!groupByCategory) {
      return [{
        id: 'all',
        name: 'All Fields',
        fields: processedColumns
      }];
    }

    // Group by field type or create custom groups
    const groups = new Map<string, Column[]>();
    
    processedColumns.forEach(column => {
      const groupKey = column.type;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(column);
    });

    return Array.from(groups.entries()).map(([type, fields]) => ({
      id: type,
      name: t(`fieldType.${type}`) || type,
      fields: fields.sort((a, b) => a.name.localeCompare(b.name))
    }));
  }, [processedColumns, groupByCategory, t]);

  // Handle field value changes with optimization
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    onFieldChange(fieldId, value);
  }, [onFieldChange]);

  // Handle search input changes
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: event.target.value }));
  }, []);

  // Toggle group collapse
  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Scroll to specific field
  const scrollToField = useCallback((fieldIndex: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(fieldIndex, 'center');
    }
  }, []);

  // Get field statistics
  const fieldStats = useMemo(() => {
    const total = processedColumns.length;
    const filled = processedColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    }).length;
    const required = processedColumns.filter(col => col.is_required).length;
    const requiredFilled = processedColumns.filter(col => {
      if (!col.is_required) return false;
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    }).length;

    return {
      total,
      filled,
      required,
      requiredFilled,
      completionRate: total > 0 ? Math.round((filled / total) * 100) : 0,
      requiredCompletionRate: required > 0 ? Math.round((requiredFilled / required) * 100) : 0
    };
  }, [processedColumns, formData]);

  // Render individual field item for virtualization
  const renderFieldItem = useCallback(({ index, style }: ListChildComponentProps) => {
    const column = processedColumns[index];
    if (!column) return null;

    return (
      <div style={style} className="px-2 py-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <FieldRenderer
              column={column}
              value={formData[column.id]}
              onChange={(value) => handleFieldChange(column.id, value)}
              readOnly={readOnly}
            />
          </CardContent>
        </Card>
      </div>
    );
  }, [processedColumns, formData, handleFieldChange, readOnly]);

  // Render grouped fields (non-virtualized for groups)
  const renderGroupedFields = () => {
    return (
      <div className="space-y-4">
        {fieldGroups.map(group => {
          const isCollapsed = collapsedGroups.has(group.id);
          
          return (
            <Card key={group.id} className="w-full">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer border-b"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{group.name}</h3>
                  <Badge variant="outline">{group.fields.length}</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
              
              {!isCollapsed && (
                <CardContent className="p-4">
                  <div className="grid gap-4">
                    {group.fields.map(column => (
                      <FieldRenderer
                        key={column.id}
                        column={column}
                        value={formData[column.id]}
                        onChange={(value) => handleFieldChange(column.id, value)}
                        readOnly={readOnly}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // Render regular (non-virtualized) fields
  const renderRegularFields = () => {
    return (
      <div className="grid gap-4">
        {processedColumns.map(column => (
          <Card key={column.id}>
            <CardContent className="p-4">
              <FieldRenderer
                column={column}
                value={formData[column.id]}
                onChange={(value) => handleFieldChange(column.id, value)}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Decide whether to use virtualization
  const shouldVirtualize = processedColumns.length > virtualizationThreshold && !groupByCategory;
  const containerHeight = Math.min(maxHeight, processedColumns.length * itemHeight);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchFields') || 'Search fields'}
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              )}
              
              {/* Field Statistics */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {t('total') || 'Total'}: {fieldStats.total}
                </Badge>
                <Badge variant="outline">
                  {t('filled') || 'Filled'}: {fieldStats.filled} ({fieldStats.completionRate}%)
                </Badge>
                <Badge variant="outline">
                  {t('required') || 'Required'}: {fieldStats.requiredFilled}/{fieldStats.required} ({fieldStats.requiredCompletionRate}%)
                </Badge>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.showRequired ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showRequired: !prev.showRequired }))}
                  >
                    {t('required') || 'Required'}
                  </Button>
                  <Button
                    variant={filters.showOptional ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showOptional: !prev.showOptional }))}
                  >
                    {t('optional') || 'Optional'}
                  </Button>
                  <Button
                    variant={filters.showFilled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showFilled: !prev.showFilled }))}
                  >
                    {t('filled') || 'Filled'}
                  </Button>
                  <Button
                    variant={filters.showEmpty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showEmpty: !prev.showEmpty }))}
                  >
                    {t('empty') || 'Empty'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      {shouldVirtualize ? (
        // Virtualized rendering for large forms
        <Card>
          <CardContent className="p-2">
            <List
              ref={listRef}
              width="100%"
              height={containerHeight}
              itemCount={processedColumns.length}
              itemSize={itemHeight}
              overscanCount={5}
              className="virtualized-list"
            >
              {renderFieldItem}
            </List>
          </CardContent>
        </Card>
      ) : groupByCategory ? (
        // Grouped rendering
        renderGroupedFields()
      ) : (
        // Regular rendering for smaller forms
        renderRegularFields()
      )}
    </div>
  );
};

export default VirtualizedFormFields;
