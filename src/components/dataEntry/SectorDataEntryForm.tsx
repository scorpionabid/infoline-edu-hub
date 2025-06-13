
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';
import { Loader2, Save, Send, RefreshCw, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  assignment: string;
  status: string;
  columns?: Column[];
}

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: Array<{ value: string; label: string }>;
  default_value?: string;
  order_index: number;
  status: string;
}

interface SectorDataEntry {
  id: string;
  sector_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SectorDataEntryFormProps {
  sectorId: string;
  categoryId: string;
  onClose?: () => void;
}

export const SectorDataEntryForm: React.FC<SectorDataEntryFormProps> = ({
  sectorId,
  categoryId,
  onClose
}) => {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch category with ONLY ACTIVE columns
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category-sector', categoryId],
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
      return data as Category;
    },
    enabled: !!categoryId
  });

  // Fetch existing entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['sector-data-entries', sectorId, categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_data_entries')
        .select('*')
        .eq('sector_id', sectorId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sectorId && !!categoryId
  });

  // Initialize form data from existing entries
  useEffect(() => {
    if (entries.length > 0) {
      const initialFormData = entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value;
        return acc;
      }, {} as Record<string, any>);
      setFormData(initialFormData);
    }
  }, [entries]);

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const updates = Object.entries(data).map(([columnId, value]) => ({
        sector_id: sectorId,
        category_id: categoryId,
        column_id: columnId,
        value: value?.toString() || '',
        status: 'draft',
        created_by: user?.id
      }));

      const { error } = await supabase
        .from('sector_data_entries')
        .upsert(updates, {
          onConflict: 'sector_id,category_id,column_id'
        });

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ 
        queryKey: ['sector-data-entries', sectorId, categoryId] 
      });
    }
  });

  // Submit for approval mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('sector_data_entries')
        .update({ status: 'pending' })
        .eq('sector_id', sectorId)
        .eq('category_id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Məlumatlar təsdiq üçün göndərildi');
      queryClient.invalidateQueries({ 
        queryKey: ['sector-data-entries', sectorId, categoryId] 
      });
      onClose?.();
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error('Göndərmə zamanı xəta baş verdi');
    }
  });

  // Handle form field changes
  const handleFieldChange = (columnId: string, value: any) => {
    const newFormData = { ...formData, [columnId]: value };
    setFormData(newFormData);
    
    // Auto-save after 2 seconds of inactivity
    const timeoutId = setTimeout(() => {
      autoSaveMutation.mutate(newFormData);
    }, 2000);

    // Clear previous timeout
    return () => clearTimeout(timeoutId);
  };

  // Manual save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await autoSaveMutation.mutateAsync(formData);
      toast.success('Məlumatlar saxlanıldı');
    } catch (error) {
      toast.error('Saxlama zamanı xəta baş verdi');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for approval
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First save current data
      await autoSaveMutation.mutateAsync(formData);
      // Then submit for approval
      await submitMutation.mutateAsync();
    } catch (error) {
      toast.error('Göndərmə zamanı xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form field based on column type
  const renderField = (column: Column) => {
    const value = formData[column.id] || column.default_value || '';

    switch (column.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
        return (
          <Input
            type={column.type}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
          />
        );

      case 'date':
      case 'datetime-local':
      case 'time':
        return (
          <Input
            type={column.type}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            required={column.is_required}
          />
        );

      case 'select':
        if (column.options && Array.isArray(column.options) && column.options.length > 0) {
          return (
            <Select value={value} onValueChange={(newValue) => handleFieldChange(column.id, newValue)}>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçin'} />
              </SelectTrigger>
              <SelectContent>
                {column.options.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
          />
        );

      case 'radio':
        if (column.options && Array.isArray(column.options) && column.options.length > 0) {
          return (
            <RadioGroup value={value} onValueChange={(newValue) => handleFieldChange(column.id, newValue)}>
              {column.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${column.id}-${index}`} />
                  <Label htmlFor={`${column.id}-${index}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          );
        }
        return null;

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => handleFieldChange(column.id, checked)}
            />
            <Label htmlFor={column.id}>{column.name}</Label>
          </div>
        );

      case 'boolean':
        return (
          <Select 
            value={value?.toString()} 
            onValueChange={(newValue) => handleFieldChange(column.id, newValue === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Bəli</SelectItem>
              <SelectItem value="false">Xeyr</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
          />
        );
    }
  };

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    if (!category?.columns || category.columns.length === 0) return 0;
    
    const requiredColumns = category.columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) return 100;
    
    const completedRequired = requiredColumns.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return Math.round((completedRequired.length / requiredColumns.length) * 100);
  }, [category, formData]);

  // Check entry status
  const entryStatus = React.useMemo(() => {
    if (entries.length === 0) return 'draft';
    const statuses = entries.map(e => e.status);
    if (statuses.some(s => s === 'pending')) return 'pending';
    if (statuses.some(s => s === 'approved')) return 'approved';
    if (statuses.some(s => s === 'rejected')) return 'rejected';
    return 'draft';
  }, [entries]);

  if (categoryLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Kateqoriya tapılmadı</p>
      </div>
    );
  }

  const columns = category.columns || [];

  return (
    <div className="space-y-6">
      {/* Header with status and progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {category.name}
              </CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                entryStatus === 'approved' ? 'default' :
                entryStatus === 'pending' ? 'secondary' :
                entryStatus === 'rejected' ? 'destructive' : 'outline'
              }>
                {entryStatus === 'approved' ? 'Təsdiqlənib' :
                 entryStatus === 'pending' ? 'Gözləyir' :
                 entryStatus === 'rejected' ? 'Rədd edilib' : 'Layihə'}
              </Badge>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tamamlanma</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Last saved indicator */}
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Son saxlanma: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Form fields */}
      <Card>
        <CardContent className="pt-6">
          {columns.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Bu kateqoriya üçün aktiv sahə tapılmadı</p>
            </div>
          ) : (
            <div className="space-y-6">
              {columns.map((column, index) => (
                <div key={column.id} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    {column.name}
                    {column.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(column)}
                  {column.help_text && (
                    <p className="text-xs text-muted-foreground">{column.help_text}</p>
                  )}
                  {index < columns.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={isSaving || autoSaveMutation.isPending}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saxlanılır...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saxla
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || entryStatus === 'pending' || entryStatus === 'approved'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Göndərilir...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Təsdiq üçün göndər
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorDataEntryForm;
