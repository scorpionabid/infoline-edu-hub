// ========================================================
// School Data Entry Manager - İyileşdirilmiş UI
// ========================================================
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, FileText, Folder, HelpCircle, CheckCircle, 
  Clock, AlertCircle, Save, Send, ChevronRight,
  LayoutGrid, List, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUnifiedDataEntry } from '@/hooks/dataEntry/useUnifiedDataEntry';

// ========================================================
// Enhanced Category Card Component
// ========================================================
interface CategoryCardProps {
  category: any;
  isSelected: boolean;
  onSelect: () => void;
  completionPercentage: number;
  totalFields: number;
  completedFields: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onSelect,
  completionPercentage,
  totalFields,
  completedFields
}) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "ring-2 ring-primary bg-primary/5 border-primary" 
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-3">
        {/* Category Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform ml-2 flex-shrink-0",
            isSelected && "rotate-90"
          )} />
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedFields}/{totalFields} sahə
            </span>
            <span className={cn(
              "font-medium",
              completionPercentage === 100 ? "text-green-600" : "text-amber-600"
            )}>
              {completionPercentage}%
            </span>
          </div>
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={completionPercentage === 100 ? "default" : "secondary"}
            className="text-xs"
          >
            {totalFields} sütun
          </Badge>
          
          {completionPercentage === 100 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">Tamamlandı</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================================
// Enhanced Form Field Component
// ========================================================
interface EnhancedFormFieldProps {
  column: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  column,
  value,
  onChange,
  error,
  disabled
}) => {
  const renderInput = () => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
    
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            className={cn(
              baseClasses,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            )}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            className={cn(
              baseClasses,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            )}
          />
        );
        
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              baseClasses,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            )}
          >
            <option value="">Seçin...</option>
            {column.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            rows={3}
            className={cn(
              baseClasses,
              "resize-none",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            )}
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            className={cn(
              baseClasses,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium leading-tight">
          {column.name}
          {column.is_required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        {column.help_text && (
          <div className="group relative">
            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {column.help_text}
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      {renderInput()}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// ========================================================
// Main School Data Entry Manager Props
// ========================================================
interface SchoolDataEntryManagerProps {
  schoolId: string;
  onClose: () => void;
  onComplete: () => void;
}

// ========================================================
// Main School Data Entry Manager Component
// ========================================================
export const SchoolDataEntryManager: React.FC<SchoolDataEntryManagerProps> = ({
  schoolId,
  onClose,
  onComplete
}) => {
  // State Management
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get school categories only
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategoriesQuery({
    assignment: 'schools'
  });

  // Data entry hook for selected category
  const dataEntryHook = useUnifiedDataEntry({
    categoryId: selectedCategoryId || '',
    entityId: schoolId,
    entityType: 'school',
    onSave: () => {},
    onSubmit: onComplete
  });

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  if (categoriesError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Xəta baş verdi: {categoriesError.message}</p>
        </CardContent>
      </Card>
    );
  }

  const schoolCategories = categories.filter(cat => 
    cat.assignment === 'schools' || cat.assignment === 'all'
  );

  // Calculate completion for categories
  const getCategoryCompletion = (categoryId: string) => {
    if (!selectedCategoryId || selectedCategoryId !== categoryId) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    
    const { columns, formData } = dataEntryHook;
    const requiredFields = columns.filter(col => col.is_required);
    const completedFields = requiredFields.filter(col => {
      const value = formData[col.id];
      return value !== undefined && value !== null && value !== '';
    });
    
    return {
      total: columns.length,
      completed: completedFields.length,
      required: requiredFields.length,
      percentage: requiredFields.length > 0 ? Math.round((completedFields.length / requiredFields.length) * 100) : 100
    };
  };

  const selectedCategory = schoolCategories.find(cat => cat.id === selectedCategoryId);

  const handleFieldChange = (columnId: string, value: any) => {
    dataEntryHook.updateEntry(columnId, value);
  };

  const handleSave = async () => {
    await dataEntryHook.saveEntries();
  };

  const handleSubmit = async () => {
    const isValid = dataEntryHook.validateForm();
    if (isValid) {
      await dataEntryHook.submitEntries();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Enhanced Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">Məktəb Məlumat Daxil Etmə</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Kömək
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={cn(
          "gap-6",
          selectedCategoryId 
            ? "grid grid-cols-1 lg:grid-cols-3" 
            : "grid grid-cols-1"
        )}>
          
          {/* Categories Section */}
          <div className={cn(
            selectedCategoryId ? "lg:col-span-1" : "lg:col-span-full"
          )}>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Kateqoriyalar</CardTitle>
                  <Badge variant="outline">
                    {schoolCategories.length} kateqoriya
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {schoolCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Məktəb üçün kateqoriya tapılmadı</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-3">
                    {schoolCategories.map(category => {
                      const completion = getCategoryCompletion(category.id);
                      return (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          isSelected={selectedCategoryId === category.id}
                          onSelect={() => setSelectedCategoryId(category.id)}
                          completionPercentage={completion.percentage}
                          totalFields={completion.total}
                          completedFields={completion.completed}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schoolCategories.map(category => {
                      const completion = getCategoryCompletion(category.id);
                      return (
                        <div
                          key={category.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedCategoryId === category.id
                              ? "bg-primary/5 border-primary"
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {completion.completed}/{completion.total} sahə
                            </p>
                          </div>
                          <Badge variant={completion.percentage === 100 ? "default" : "secondary"}>
                            {completion.percentage}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          {selectedCategoryId && (
            <div className="lg:col-span-2 space-y-6">
              {/* Form Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="truncate">{selectedCategory?.name}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {selectedCategory?.description}
                      </p>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 ml-4">
                      {dataEntryHook.hasUnsavedChanges && (
                        <Badge variant="outline" className="text-orange-600 whitespace-nowrap">
                          Saxlanmamış
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {dataEntryHook.completionPercentage}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Form Fields */}
              {dataEntryHook.isLoading ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <LoadingSpinner />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {dataEntryHook.columns.map(column => (
                        <EnhancedFormField
                          key={column.id}
                          column={column}
                          value={dataEntryHook.formData[column.id]}
                          onChange={(value) => handleFieldChange(column.id, value)}
                          error={dataEntryHook.errors[column.id]}
                          disabled={dataEntryHook.isSaving || dataEntryHook.isSubmitting}
                        />
                      ))}
                      
                      {dataEntryHook.columns.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Bu kateqoriya üçün sahə tapılmadı</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(dataEntryHook.formData).filter(key => {
                          const value = dataEntryHook.formData[key];
                          return value !== undefined && value !== null && value !== '';
                        }).length} / {dataEntryHook.columns.length} sahə dolduruldu
                      </div>
                      
                      {!dataEntryHook.isValid && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-xs">
                            {Object.keys(dataEntryHook.errors).length} xəta var
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSave}
                        disabled={dataEntryHook.isSaving || (!dataEntryHook.hasUnsavedChanges)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {dataEntryHook.isSaving ? 'Saxlanılır...' : 'Saxla'}
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={dataEntryHook.isSubmitting || !dataEntryHook.isValid}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {dataEntryHook.isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Panel */}
          {showHelp && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-sm">Kömək Paneli</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Necə istifadə edilir:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Sol tərəfdə kateqoriyaları seçin</li>
                      <li>• Məcburi sahələri (*) mütləq doldurun</li>
                      <li>• Avtomatik saxlama aktivdir</li>
                      <li>• "Təsdiq üçün göndər" düyməsi ilə təqdim edin</li>
                    </ul>
                  </div>
                  
                  {selectedCategory && (
                    <div>
                      <h4 className="font-medium mb-2">Cari kateqoriya:</h4>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {selectedCategory.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDataEntryManager;