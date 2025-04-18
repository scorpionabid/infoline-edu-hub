
import React from 'react';
import { ColumnType, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnTypeSelectorProps {
  control: Control<any>;
  onChange?: (type: ColumnType) => void;
  value?: ColumnType;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({
  control,
  onChange,
  value
}) => {
  const { t } = useLanguage();
  
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
  
  const handleChange = (newType: ColumnType) => {
    if (onChange) {
      onChange(newType);
    }
  };
  
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>{t('columnType')}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {columnTypeGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{group.title}</h4>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChange(value as ColumnType);
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
                  >
                    {group.types.map((type) => {
                      const typeDefinition = COLUMN_TYPE_DEFINITIONS[type];
                      const isSelected = field.value === type;
                      
                      // Icon komponentin adını əldə et
                      const IconComponent = Icons[typeDefinition.icon as keyof typeof Icons] || Icons.circle;

                      return (
                        <TooltipProvider key={type}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "border rounded-md p-3 cursor-pointer transition-all duration-200 flex items-center space-x-3",
                                  isSelected 
                                    ? "border-primary bg-primary/10" 
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                                )}
                                onClick={() => {
                                  field.onChange(type);
                                  handleChange(type);
                                }}
                              >
                                <RadioGroupItem value={type} id={`type-${type}`} className="sr-only" />
                                <div className={cn(
                                  "w-10 h-10 rounded-md flex items-center justify-center",
                                  isSelected ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                                )}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`type-${type}`} className={cn(
                                    "text-sm font-medium",
                                    isSelected ? "text-primary" : "text-foreground"
                                  )}>
                                    {typeDefinition.label}
                                  </Label>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{typeDefinition.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ColumnTypeSelector;
