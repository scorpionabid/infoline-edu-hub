
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { CategoryWithColumns } from '@/types/column';
import EntryField from './EntryField';
import { Button } from '@/components/ui/button';
import ColumnEntryForm from './ColumnEntryForm';
import { validateEntry } from './utils/formUtils';
import { toast } from 'sonner';
import { AlertTriangle, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryFormProps {
  category: CategoryWithColumns;
  initialEntries?: any[];
  onSave: (entries: any[]) => Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  initialEntries = [],
  onSave,
  loading = false,
  readOnly = false
}) => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Təyin edək ki, category.columns boş deyilsə ondan istifadə edək, əks halda boş massiv
  const resolvedCategory: CategoryWithColumns = {
    ...category,
    columns: category?.columns || [] as Column[]
  };

  // Qqruplaşdırılmış sütunları hesablamaq
  const groupedColumns = React.useMemo(() => {
    if (!resolvedCategory?.columns?.length) return {};

    return resolvedCategory.columns.reduce((groups, column) => {
      const group = column.section || 'default';
      groups[group] = [...(groups[group] || []), column];
      return groups;
    }, {} as Record<string, Column[]>);
  }, [resolvedCategory]);

  // İlkin dəyərləri yükləyirik
  useEffect(() => {
    if (initialEntries?.length) {
      const initialValues = initialEntries.reduce((values, entry) => {
        values[entry.columnId] = entry.value;
        return values;
      }, {} as Record<string, any>);
      setEntries(initialValues);
    }
  }, [initialEntries]);

  // Dəyər dəyişdikdə xətanı yoxlayırıq
  const handleValueChange = useCallback((columnId: string, value: any) => {
    setEntries(prev => ({ ...prev, [columnId]: value }));

    const column = resolvedCategory.columns.find(c => c.id === columnId);
    if (column) {
      const validationResult = validateEntry(column, value);
      
      setErrors(prev => ({
        ...prev,
        [columnId]: validationResult.isValid ? '' : validationResult.error
      }));
    }
  }, [resolvedCategory.columns]);

  // Bölməni genişləndirmək/yığmaq
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Formu təqdim etmək
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Məcburi sahələri yoxlayırıq
    const requiredColumns = resolvedCategory.columns.filter(column => column.is_required);
    const newErrors: Record<string, string> = {};
    
    for (const column of requiredColumns) {
      const value = entries[column.id];
      if (value === undefined || value === null || value === '') {
        newErrors[column.id] = t('fieldRequired');
      }
    }
    
    // Xətalar varsa, göstəririk və qayıdırıq
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('formHasErrors'));
      return;
    }
    
    // Bütün dəyərləri uyğun formata çeviririk
    setIsSaving(true);
    try {
      const submittedEntries = resolvedCategory.columns.map(column => ({
        columnId: column.id,
        categoryId: column.category_id,
        value: entries[column.id] !== undefined ? entries[column.id] : '',
      }));
      
      await onSave(submittedEntries);
      toast.success(t('dataSaved'));
    } catch (error) {
      console.error('Form təqdim etmə xətası:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setIsSaving(false);
    }
  };

  // Kateqoriya yüklənmədisə
  if (!category && loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Kateqoriya boşdursa
  if (!resolvedCategory.columns?.length) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <p className="text-lg font-medium">
          {t('noCategoriesFound')}
        </p>
      </div>
    );
  }

  // Son tarix varsa, formatlamasını edək
  const deadline = resolvedCategory.deadline
    ? new Date(resolvedCategory.deadline).toLocaleDateString()
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kateqoriya başlığı və deadline */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{resolvedCategory.name}</h2>
          {resolvedCategory.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {resolvedCategory.description}
            </p>
          )}
        </div>
        {deadline && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{t('deadline')}: {deadline}</span>
          </div>
        )}
      </div>

      {/* Qruplaşdırılmamış sütunlar */}
      {Object.entries(groupedColumns).map(([section, columns]) => {
        const isExpanded = expandedSections[section] !== false; // Default açıq

        return (
          <div key={section} className="border rounded-md overflow-hidden mb-6">
            {/* Bölmə başlığı - 'default' deyilsə göstəririk */}
            {section !== 'default' && (
              <div 
                className="flex items-center justify-between bg-muted p-3 cursor-pointer"
                onClick={() => toggleSection(section)}
              >
                <h3 className="font-medium">{section}</h3>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            )}
            
            {/* Sütunlar */}
            {(section === 'default' || isExpanded) && (
              <div className="p-4 space-y-4">
                {columns.map(column => (
                  <EntryField
                    key={column.id}
                    column={column}
                    value={entries[column.id] || ''}
                    onChange={(value) => handleValueChange(column.id, value)}
                    error={errors[column.id]}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Submit düyməsi - readOnly rejimində göstərmirik */}
      {!readOnly && (
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSaving || loading}
            className="min-w-[120px]"
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      )}
      
      {/* Kateqoriya ilə əlaqəli digər formlar */}
      {resolvedCategory.related && (
        <ColumnEntryForm
          categoryId={resolvedCategory.id}
        />
      )}
    </form>
  );
};

export default CategoryForm;
