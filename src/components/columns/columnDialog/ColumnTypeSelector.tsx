
import React from 'react';
import { FormControl } from '@/components/ui/form';
import { ColumnType, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/utils/cn';
import { Label } from '@/components/ui/label';
import {
  Text,
  TextAlignLeft,
  Hash,
  Calendar,
  ListBox,
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
  CalendarClock,
  FormattingTwo
} from 'lucide-react';

interface ColumnTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const iconComponents: Record<string, React.FC<{ className?: string }>> = {
  text: Text,
  textAlignLeft: TextAlignLeft,
  hash: Hash,
  calendar: Calendar,
  listBox: ListBox,
  check: Check,
  circle: Circle,
  file: File,
  image: Image,
  mail: Mail,
  link: Link,
  phone: Phone,
  sliders: Sliders,
  palette: Palette,
  lock: Lock,
  clock: Clock,
  calendarClock: CalendarClock,
  formattingTwo: FormattingTwo
};

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ value, onChange, disabled = false }) => {
  const { t } = useLanguage();

  // Bütün mövcud tipləri əldə edirik
  const columnTypes = Object.entries(COLUMN_TYPE_DEFINITIONS).map(([type, definition]) => ({
    value: type as ColumnType,
    label: definition.label,
    description: definition.description,
    icon: definition.icon
  }));

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
              const typeInfo = COLUMN_TYPE_DEFINITIONS[type];
              const IconComponent = iconComponents[typeInfo.icon];
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
                  {IconComponent && <IconComponent className="h-5 w-5 mb-1" />}
                  <span className="text-xs">{typeInfo.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">{t("advancedTypes")}</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {advancedTypes.map((type) => {
              const typeInfo = COLUMN_TYPE_DEFINITIONS[type];
              const IconComponent = iconComponents[typeInfo.icon];
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
                  {IconComponent && <IconComponent className="h-4 w-4 mb-1" />}
                  <span className="text-xs">{typeInfo.label}</span>
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
