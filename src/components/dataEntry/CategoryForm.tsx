
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from './FormFields';
import { Column, CategoryWithColumns } from '@/types/column';
import { EntryValue, DataEntryStatus } from '@/types/dataEntry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';

type StatusType = 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected' | 'partial';

interface CategoryFormProps {
  category: CategoryWithColumns;
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onSubmit?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  values,
  onChange,
  isDisabled = false,
  isLoading = false,
  onApprove,
  onReject,
  onSubmit
}) => {
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Calculate overall category status for UI display
  const getCategoryStatusBadge = () => {
    const status = category.status as StatusType;
    
    // String tipini karşılaştırma yapabileceğimiz bir string olarak değerlendiriyoruz
    if (status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <Check className="w-3 h-3 mr-1" /> Təsdiqlənmiş
        </Badge>
      );
    }
    
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" /> Gözləmədə
        </Badge>
      );
    }
    
    if (status === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <AlertCircle className="w-3 h-3 mr-1" /> Rədd edilmiş
        </Badge>
      );
    }
    
    // Digər statuslar üçün (active, inactive, draft, partial)
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  // Tamamlanma faizi göstərən proqres komponenti
  const CompletionBadge = () => {
    const percentage = category.completionPercentage || 0;
    
    let color = 'text-gray-500';
    if (percentage >= 70) color = 'text-green-600';
    else if (percentage >= 30) color = 'text-yellow-500';
    else color = 'text-red-500';
    
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium">Tamamlanma:</div>
        <div className={`text-sm font-bold ${color}`}>{percentage}%</div>
      </div>
    );
  };
  
  // Tab başlığında statusu göstər
  const getTabStatusBadge = (tabId: string) => {
    // Find all entries for this tab
    const tabEntries = values.filter(entry => {
      const column = category.columns.find(col => col.id === entry.columnId);
      return column && (tabId === 'all' || column.type === tabId);
    });
    
    if (tabEntries.length === 0) return null;
    
    // Count status types
    const statusCounts = tabEntries.reduce((acc, entry) => {
      const status = entry.status as DataEntryStatus;
      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {} as Record<DataEntryStatus, number>);
    
    if (statusCounts.pending && statusCounts.pending === tabEntries.length) {
      return <Clock className="w-3 h-3 text-yellow-500" />;
    }
    
    if (statusCounts.approved && statusCounts.approved === tabEntries.length) {
      return <Check className="w-3 h-3 text-green-500" />;
    }
    
    if (statusCounts.rejected && statusCounts.rejected === tabEntries.length) {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
    
    // If mixed statuses
    return <Clock className="w-3 h-3 text-gray-500" />;
  };
  
  const toggleTab = (tabId: string) => {
    const newExpanded = new Set(expandedTabs);
    if (newExpanded.has(tabId)) {
      newExpanded.delete(tabId);
    } else {
      newExpanded.add(tabId);
    }
    setExpandedTabs(newExpanded);
  };
  
  // Group columns by type for tabs
  const columnTypes = React.useMemo(() => {
    const types = new Set<string>();
    category.columns.forEach(column => {
      types.add(column.type);
    });
    return ['all', ...Array.from(types)];
  }, [category.columns]);
  
  // Filter columns based on active tab
  const filteredColumns = React.useMemo(() => {
    if (activeTab === 'all') {
      return category.columns;
    }
    return category.columns.filter(column => column.type === activeTab);
  }, [category.columns, activeTab]);

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
          <div className="flex items-center space-x-2">
            {getCategoryStatusBadge()}
            <CompletionBadge />
          </div>
        </div>
        {category.description && (
          <CardDescription>{category.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Tab navigation for column types */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {columnTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="flex items-center space-x-1">
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                {getTabStatusBadge(type)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Tab contents */}
          <TabsContent value={activeTab} className="space-y-4">
            {filteredColumns.map((column) => {
              const entry = values.find(v => v.columnId === column.id);
              const entryValue = entry?.value || '';
              const entryStatus = entry?.status as DataEntryStatus | undefined;
              const error = entry?.error;
              
              return (
                <div key={column.id} className="p-3 border rounded-md bg-white">
                  <FormField
                    column={column}
                    value={entryValue}
                    onChange={(value) => onChange(column.id, value)}
                    disabled={isDisabled || isLoading || entryStatus === 'approved'}
                    entryStatus={entryStatus}
                    error={error}
                  />
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex space-x-2">
          {onApprove && (
            <Button
              variant="default"
              size="sm"
              onClick={onApprove}
              disabled={isLoading || (category.status as StatusType) === 'approved'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" /> Təsdiq et
            </Button>
          )}
          
          {onReject && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onReject}
              disabled={isLoading || (category.status as StatusType) === 'approved' || (category.status as StatusType) === 'pending'}
            >
              <AlertCircle className="w-4 h-4 mr-1" /> Rədd et
            </Button>
          )}
        </div>
        
        {onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={isLoading || (category.status as StatusType) === 'approved'}
          >
            {isLoading ? 'Göndərilir...' : 'Göndər'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
