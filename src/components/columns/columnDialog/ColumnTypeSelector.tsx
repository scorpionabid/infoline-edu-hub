
import React from 'react';
import { ColumnType, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ColumnTypeSelectorProps {
  // Yeni interfeys
  selectedType?: ColumnType;
  onTypeChange?: (type: ColumnType) => void;
  disabled?: boolean;
  
  // Köhnə interfeys (geriyə uyğunluq üçün)
  control?: Control<any>;
  onChange?: (type: ColumnType) => void;
  value?: ColumnType;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({
  // Yeni interfeys
  selectedType,
  onTypeChange,
  disabled = false,
  
  // Köhnə interfeys
  control,
  onChange,
  value
}) => {
  const { t } = useLanguage();
  
  // Aktual dəyəri müəyyən edirik
  const actualType = selectedType || value || 'text';
  
  // Dəyişiklik funksiyasını müəyyən edirik
  const handleTypeChange = (newType: ColumnType) => {
    if (onTypeChange) {
      onTypeChange(newType);
    }
    if (onChange) {
      onChange(newType);
    }
  };
  
  // Funksional sütun tipləri qrupları
  const columnTypeGroups = [
    {
      title: t('basicColumnTypes'),
      types: ['text', 'textarea', 'number', 'select', 'date', 'checkbox', 'radio'] as ColumnType[]
    },
    {
      title: t('advancedColumnTypes'),
      types: ['email', 'url', 'phone', 'file', 'image'] as ColumnType[]
    },
    {
      title: t('specializedColumnTypes'),
      types: ['range', 'color', 'password', 'time', 'datetime', 'richtext'] as ColumnType[]
    }
  ];
  
  // Icon komponentini təhlükəsiz şəkildə əldə etmək üçün funksiya
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName || typeof iconName !== 'string') {
      return <Icons.circle className="h-4 w-4" />;
    }
    
    const IconComponent = Icons[iconName as keyof typeof Icons];
    if (!IconComponent) {
      console.warn(`Icon not found: ${iconName}`);
      return <Icons.circle className="h-4 w-4" />;
    }
    
    return <IconComponent className="h-4 w-4" />;
  };
  
  // Seçilmiş tipin tərifini alırıq
  const selectedTypeDefinition = COLUMN_TYPE_DEFINITIONS[actualType as keyof typeof COLUMN_TYPE_DEFINITIONS];
  
  // Əgər control prop-u varsa, FormField istifadə edirik
  if (control) {
    return (
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>{t('columnType')}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleTypeChange(value as ColumnType);
              }}
              defaultValue={field.value}
              value={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectColumnType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {columnTypeGroups.map((group) => (
                  <SelectGroup key={group.title}>
                    <SelectLabel>{group.title}</SelectLabel>
                    {group.types.map((type) => {
                      const typeDefinition = COLUMN_TYPE_DEFINITIONS[type];
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {typeDefinition && typeDefinition.icon ? 
                              renderIcon(typeDefinition.icon) : 
                              <Icons.circle className="h-4 w-4" />}
                            <span>{typeDefinition && typeDefinition.label ? typeDefinition.label : t(type)}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {selectedTypeDefinition && (
              <FormDescription>
                {selectedTypeDefinition.description || t(`${field.value}Description`)}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  
  // Əgər control prop-u yoxdursa, sadə Select istifadə edirik
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('columnType')}</label>
      <Select
        onValueChange={(value) => handleTypeChange(value as ColumnType)}
        defaultValue={actualType}
        value={actualType}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('selectColumnType')} />
        </SelectTrigger>
        <SelectContent>
          {columnTypeGroups.map((group) => (
            <SelectGroup key={group.title}>
              <SelectLabel>{group.title}</SelectLabel>
              {group.types.map((type) => {
                const typeDefinition = COLUMN_TYPE_DEFINITIONS[type];
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {typeDefinition && typeDefinition.icon ? 
                        renderIcon(typeDefinition.icon) : 
                        <Icons.circle className="h-4 w-4" />}
                      <span>{typeDefinition && typeDefinition.label ? typeDefinition.label : t(type)}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {selectedTypeDefinition && (
        <p className="text-sm text-muted-foreground">
          {selectedTypeDefinition.description || t(`${actualType}Description`)}
        </p>
      )}
    </div>
  );
};

export default ColumnTypeSelector;
