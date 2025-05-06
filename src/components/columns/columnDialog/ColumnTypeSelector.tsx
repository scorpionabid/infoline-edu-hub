
import React from 'react';
import { FormControl } from '@/components/ui/form';
import { ColumnType, columnTypes } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  Text,
  AlignLeft,
  Hash,
  Calendar,
  List,
  Check,
  Circle,
  File,
  Image,
  Mail,
  Link,
  Phone,
  Sliders,
  Palette,
  Lock,
  Clock,
  Type,
  CalendarClock,
  FileText
} from 'lucide-react';

interface ColumnTypeSelectorProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;
}

// İkon adlarını React komponentlərinə çevirmək üçün map
const iconMap = {
  'Text': Text,
  'AlignLeft': AlignLeft,
  'Hash': Hash,
  'Calendar': Calendar,
  'List': List,
  'Check': Check,
  'Circle': Circle,
  'File': File,
  'Image': Image,
  'Mail': Mail,
  'Link': Link,
  'Phone': Phone,
  'Sliders': Sliders,
  'Palette': Palette,
  'Lock': Lock,
  'Clock': Clock,
  'Type': Type,
  'CalendarClock': CalendarClock,
  'FileText': FileText
};

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  // Bütün mövcud tipləri əldə edirik və ikonları React komponentlərinə çeviririk
  const availableColumnTypes = Object.entries(columnTypes).map(([type, definition]) => {
    // İkon adını React komponentinə çeviririk
    const IconComponent = iconMap[definition.icon as keyof typeof iconMap] || Text;
    
    return {
      value: type as ColumnType,
      label: definition.label,
      description: definition.description,
      icon: <IconComponent className="h-4 w-4" />
    };
  });

  // Əsas tiplər və əlavə tiplər
  const primaryTypes: ColumnType[] = ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio'];
  const advancedTypes: ColumnType[] = ['file', 'image', 'email', 'url', 'phone', 'range', 'color', 'password', 'time', 'datetime', 'richtext'];

  return (
    <FormControl>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">{t("primaryTypes")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {primaryTypes.map((type) => {
              const typeInfo = availableColumnTypes.find((columnType) => columnType.value === type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange(type)}
                  disabled={disabled}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border border-input",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    value === type && "bg-accent text-accent-foreground border-primary"
                  )}
                >
                  {typeInfo?.icon}
                  <span className="text-xs">{typeInfo?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">{t("advancedTypes")}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {advancedTypes.map((type) => {
              const typeInfo = availableColumnTypes.find((columnType) => columnType.value === type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange(type)}
                  disabled={disabled}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-md border border-input",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    value === type && "bg-accent text-accent-foreground border-primary"
                  )}
                >
                  {typeInfo?.icon}
                  <span className="text-xs">{typeInfo?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </FormControl>
  );
};

export default ColumnTypeSelector;
