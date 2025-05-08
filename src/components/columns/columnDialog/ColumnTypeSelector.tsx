
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
import { ColumnType, columnTypeDefinitions } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

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
