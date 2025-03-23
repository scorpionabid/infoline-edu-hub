
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CategoryHeader from './components/CategoryHeader';
import FormField from './components/FormField';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDataEntry } from '@/hooks/useDataEntry';
import { Check, Clock, XCircle, AlertTriangle, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ApprovalAlert from './components/ApprovalAlert';
import RejectionAlert from './components/RejectionAlert';
import { Category, Column } from '@/types/column'; // dataEntry tipi əvəzinə column tipindən istifadə edirik

interface DataEntryFormProps {
  selectedCategory?: string | null;
  onCategoryChange?: (categoryId: string) => void;
  categories: Category[];
  columns: Column[];
  loading?: boolean;
  compact?: boolean;
  initialCategoryId?: string | null; // Props üçün initialCategoryId əlavə edirik
  statusFilter?: string | null; // Statusfiltri əlavə edirik
  onDataChanged?: () => void; // Verilənlər dəyişdiyində çağırılacaq callback
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  columns,
  loading = false,
  compact = false,
  initialCategoryId,
  statusFilter,
  onDataChanged
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string | null>(selectedCategory);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  
  // İlkin seçilmiş kateqoriyanı təyin edirik
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      setActiveTab(selectedCategory);
    } else if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].id);
    }
  }, [selectedCategory, categories, activeTab]);
  
  // Kateqoriya dəyişdikdə callback funksiyasını çağırırıq
  useEffect(() => {
    if (onCategoryChange && activeTab) {
      onCategoryChange(activeTab);
    }
  }, [activeTab, onCategoryChange]);
  
  // Aktiv kateqoriyaya aid sütunları tapırıq
  const getColumnsForCategory = (categoryId: string): Column[] => {
    return columns.filter(column => column.categoryId === categoryId);
  };
  
  // Kateqoriya başlığına klikləndikdə
  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };
  
  // Sütun seçildikdə
  const handleColumnClick = (columnId: string) => {
    setSelectedColumnId(columnId);
  };
  
  // Form sahəsi dəyəri dəyişdikdə
  const handleFieldChange = (value: any) => {
    console.log('Field value changed:', value);
    if (onDataChanged) onDataChanged();
  };
  
  // Minimal görünüş - bütün kateqoriyalar görünür, kateqoriya seçildikdə sütunlar sətir formasında göstərilir
  if (!selectedCategory && categories.length > 0) {
    return (
      <div className="space-y-4">
        {/* Kateqoriyalar siyahısı */}
        {categories.map(category => (
          <Card key={category.id} className="overflow-hidden">
            <div 
              className={cn(
                "flex justify-between items-center p-4 cursor-pointer",
                expandedCategory === category.id ? "bg-muted" : ""
              )}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              {expandedCategory === category.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            
            {/* Sütunlar siyahısı - kateqoriya seçildikdə göstərilir */}
            {expandedCategory === category.id && (
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {getColumnsForCategory(category.id).map(column => (
                    <Button
                      key={column.id}
                      variant={selectedColumnId === column.id ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "text-sm",
                        column.isRequired && "border-orange-300"
                      )}
                      onClick={() => handleColumnClick(column.id)}
                    >
                      {column.name}
                      {column.isRequired && <span className="ml-1 text-orange-500">*</span>}
                    </Button>
                  ))}
                </div>
                
                {/* Seçilmiş sütun üçün form sahəsi */}
                {selectedColumnId && (
                  <div className="mt-4 border p-4 rounded-md">
                    {columns.find(c => c.id === selectedColumnId)?.name && (
                      <FormField
                        key={selectedColumnId}
                        column={columns.find(c => c.id === selectedColumnId)!}
                        value=""
                        onChange={handleFieldChange}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dataEntryForm')}</CardTitle>
        <CardDescription>{t('enterDataCarefully')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>{t('loadingCategories')}</p>
        ) : categories.length === 0 ? (
          <p>{t('noCategoriesAvailable')}</p>
        ) : (
          <Tabs value={activeTab || ''} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="relative">
                  {category.name}
                  {/* Status badge - optional */}
                  {category.status === 'pending' && (
                    <Badge variant="secondary" className="absolute top-1 right-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {t('pending')}
                    </Badge>
                  )}
                  {category.status === 'approved' && (
                    <Badge variant="secondary" className="absolute top-1 right-1">
                      <Check className="h-3 w-3 mr-1" />
                      {t('approved')}
                    </Badge>
                  )}
                  {category.status === 'rejected' && (
                    <Badge variant="destructive" className="absolute top-1 right-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t('rejected')}
                    </Badge>
                  )}
                  {category.status === 'dueSoon' && (
                    <Badge variant="outline" className="absolute top-1 right-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('dueSoon')}
                    </Badge>
                  )}
                  {category.status === 'overdue' && (
                    <Badge variant="destructive" className="absolute top-1 right-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t('overdue')}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-2">
                <CategoryHeader 
                  name={category.name}
                  description={category.description}
                  deadline={category.deadline}
                  isSubmitted={false}
                />
                <Separator />
                {getColumnsForCategory(category.id).map((column) => (
                  <FormField
                    key={column.id}
                    id={column.id}
                    label={column.name}
                    type={column.type}
                    required={column.isRequired}
                    options={column.options}
                    placeholder={column.placeholder}
                    helpText={column.helpText}
                    value=""
                    onChange={handleFieldChange}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <ApprovalAlert isApproved={false} />
        <RejectionAlert errorMessage={""} />
        <Button type="submit">{t('submitForm')}</Button>
      </CardFooter>
    </Card>
  );
};

export default DataEntryForm;
