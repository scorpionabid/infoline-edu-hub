import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Building, Save, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { saveSingleSectorDataEntry } from '@/services/api/sectorDataEntry';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
  validation?: any;
  placeholder?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: string;
}

interface DirectSectorDataEntryProps {
  sectorId: string;
  categoryId: string;
  columnId: string;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * 🏢 Sektor Məlumat Daxil Etmə Komponenti
 * 
 * Bu komponent sektoradmin-lərin birbaşa sektor üçün məlumat daxil etməsini təmin edir.
 * Məlumatlar sector_data_entries cədvəlinə yazılır və avtomatik olaraq approved statusu alır.
 */
export const DirectSectorDataEntry: React.FC<DirectSectorDataEntryProps> = ({
  sectorId,
  categoryId,
  columnId,
  onClose,
  onComplete
}) => {
  const { toast } = useToast();
  const user = useAuthStore(selectUser);
  
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch column details
  const { data: column, isLoading: columnLoading, error: columnError } = useQuery({
    queryKey: ['column', columnId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();
      
      if (error) throw error;
      return data as Column;
    }
  });

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      return data as Category;
    }
  });

  // Fetch sector details
  const { data: sector, isLoading: sectorLoading } = useQuery({
    queryKey: ['sector', sectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', sectorId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch existing value if any
  const { data: existingEntry, isLoading: entryLoading } = useQuery({
    queryKey: ['sector-data-entry', sectorId, categoryId, columnId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sector_data_entries')
        .select('*')
        .eq('sector_id', sectorId)
        .eq('category_id', categoryId)
        .eq('column_id', columnId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    }
  });

  // Set existing value when data loads
  useEffect(() => {
    if (existingEntry?.value) {
      setInputValue(existingEntry.value);
    }
  }, [existingEntry]);

  // Validation function
  const validateInput = (value: string): string | null => {
    if (!column) return null;

    // Required field validation
    if (column.is_required && !value.trim()) {
      return 'Bu sahə məcburidir';
    }

    // Type-specific validation
    switch (column.type) {
      case 'number':
        if (value && isNaN(Number(value))) {
          return 'Yalnız rəqəm daxil edin';
        }
        break;
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          return 'Düzgün email formatı daxil edin';
        }
        break;
      case 'url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          return 'Düzgün URL formatı daxil edin (http:// və ya https://)';
        }
        break;
    }

    // Custom validation rules
    if (column.validation) {
      const validation = column.validation;
      
      if (validation.min && value.length < validation.min) {
        return `Minimum ${validation.min} simvol tələb olunur`;
      }
      
      if (validation.max && value.length > validation.max) {
        return `Maksimum ${validation.max} simvol icazə verilir`;
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return 'Daxil edilən format düzgün deyil';
      }
    }

    return null;
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!column || !user) return;

    // Validate input
    const error = validateInput(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveSingleSectorDataEntry(
        sectorId,
        categoryId,
        columnId,
        inputValue,
        user.id
      );

      toast({
        title: "Məlumat uğurla yadda saxlandı",
        description: `Sektor üçün ${column.name} məlumatı təsdiq olunmuş statusda yadda saxlandı.`,
        variant: "default",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving sector data:', error);
      toast({
        title: "Xəta baş verdi",
        description: "Məlumat yadda saxlanıla bilmədi. Zəhmət olmasa yenidən cəhd edin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (columnLoading || categoryLoading || sectorLoading || entryLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Məlumatlar yüklənir...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (columnError || !column || !category || !sector) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Məlumatlar yüklənərkən xəta baş verdi</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Sektor Məlumat Daxil Etmə
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                🏢 {sector.name}
              </Badge>
              <Badge variant="outline">
                {category.name}
              </Badge>
              <Badge variant="secondary">
                {column.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {category.assignment === 'sectors' ? (
                <span className="text-blue-700 font-medium">Sektorlara aid kateqoriya</span>
              ) : (
                <span>Ümumi kateqoriya</span>
              )}
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-3">
          <Label htmlFor="sector-input" className="text-base font-medium">
            {column.name} {column.is_required && <span className="text-destructive">*</span>}
          </Label>
          
          {column.help_text && (
            <p className="text-sm text-muted-foreground">
              {column.help_text}
            </p>
          )}

          {column.type === 'textarea' ? (
            <Textarea
              id="sector-input"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={column.placeholder || `${column.name} daxil edin...`}
              className={validationError ? 'border-destructive' : ''}
              rows={4}
            />
          ) : (
            <Input
              id="sector-input"
              type={column.type === 'number' ? 'number' : 'text'}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={column.placeholder || `${column.name} daxil edin...`}
              className={validationError ? 'border-destructive' : ''}
            />
          )}

          {validationError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Existing Value Info */}
        {existingEntry && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                Bu sütun üçün əvvəllər məlumat daxil edilib. Yeni məlumat əvvəlkini əvəz edəcək.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !inputValue.trim()}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Yadda saxlanılır...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Yadda saxla
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Bağla
          </Button>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-medium">Avtomatik təsdiq</p>
              <p>Sektor məlumatları avtomatik olaraq təsdiq olunmuş statusda yadda saxlanır.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};