
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// Define column type definitions with corresponding UI-friendly labels and icons
const columnTypeDefinitions = {
  text: { label: 'Mətn', description: 'Mətn sahəsi', icon: 'text' },
  number: { label: 'Rəqəm', description: 'Rəqəm sahəsi', icon: 'hash' },
  textarea: { label: 'Mətn sahəsi', description: 'Çoxsətirli mətn sahəsi', icon: 'textAlignLeft' },
  select: { label: 'Seçim', description: 'Dropdown seçim sahəsi', icon: 'listBox' },
  checkbox: { label: 'Çoxlu seçim', description: 'Birdən çox seçim etmək mümkündür', icon: 'check' },
  radio: { label: 'Tək seçim', description: 'Yalnız bir seçim etmək mümkündür', icon: 'circle' },
  date: { label: 'Tarix', description: 'Tarix seçimi', icon: 'calendar' },
  datetime: { label: 'Tarix və saat', description: 'Tarix və saat seçimi', icon: 'calendarClock' },
  time: { label: 'Vaxt', description: 'Vaxt seçimi', icon: 'clock' },
  email: { label: 'E-poçt', description: 'E-poçt sahəsi', icon: 'mail' },
  url: { label: 'URL', description: 'URL sahəsi', icon: 'link' },
  phone: { label: 'Telefon', description: 'Telefon nömrəsi sahəsi', icon: 'phone' },
  file: { label: 'Fayl', description: 'Fayl yükləmə sahəsi', icon: 'file' },
  image: { label: 'Şəkil', description: 'Şəkil yükləmə sahəsi', icon: 'image' },
  color: { label: 'Rəng', description: 'Rəng seçimi sahəsi', icon: 'palette' },
  password: { label: 'Şifrə', description: 'Şifrə sahəsi', icon: 'lock' },
  richtext: { label: 'Zəngin mətn', description: 'Formatlaşdırılmış mətn sahəsi', icon: 'formattingTwo' },
  range: { label: 'Aralıq', description: 'Aralıq seçimi sahəsi', icon: 'sliders' }
};

interface ColumnTypeSelectorProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const columnTypes = Object.entries(columnTypeDefinitions) as [ColumnType, typeof columnTypeDefinitions.text][];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
        >
          {value ? (
            <span className="flex items-center">
              <span className="mr-2">{columnTypeDefinitions[value]?.icon}</span>
              {columnTypeDefinitions[value]?.label}
            </span>
          ) : (
            t('selectColumnType')
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={t('searchColumnTypes')} />
          <CommandEmpty>{t('noColumnTypesFound')}</CommandEmpty>
          <CommandGroup>
            {columnTypes.map(([type, definition]) => (
              <CommandItem
                key={type}
                value={type}
                onSelect={() => {
                  onChange(type);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === type ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{definition.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {definition.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ColumnTypeSelector;
