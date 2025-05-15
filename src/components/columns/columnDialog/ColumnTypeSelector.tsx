
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ColumnType } from '@/types/column';
import { Icons } from '@/components/ui/icons';
import { LucideIcon } from 'lucide-react';
import { columnTypeDefinitions } from '@/types/column';

interface ColumnTypeSelectorProps {
  value: ColumnType;
  onValueChange: (value: ColumnType) => void;
}

export function ColumnTypeSelector({ value, onValueChange }: ColumnTypeSelectorProps) {
  // Helper function to get icon component
  const getIconComponent = (iconName: string): LucideIcon => {
    const iconKey = iconName as keyof typeof Icons;
    // Provide a default icon if the requested one doesn't exist
    return Icons[iconKey] || Icons.circle;
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onValueChange(val as ColumnType)}
      className="grid grid-cols-3 gap-4"
    >
      {columnTypeDefinitions.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="col-span-3">
          <h3 className="mb-2 text-sm font-medium">{group.group}</h3>
          <div className="grid grid-cols-3 gap-2">
            {group.types.map((type) => {
              const IconComponent = getIconComponent(type.icon);
              
              return (
                <div key={type.value}>
                  <RadioGroupItem
                    value={type.value}
                    id={`type-${type.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                      value === type.value ? "border-primary" : ""
                    )}
                  >
                    <IconComponent className="mb-2 h-6 w-6" />
                    <div className="text-center">
                      <p className="font-medium leading-none">{type.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}

export default ColumnTypeSelector;
