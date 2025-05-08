
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { ColumnType, columnTypeDefinitions } from '@/types/column';
import { Icons } from '@/components/ui/icons';

interface ColumnTypeSelectorProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
}

const typeGroups = [
  {
    title: 'Mətn',
    types: ['text', 'textarea', 'richtext'] as ColumnType[]
  },
  {
    title: 'Rəqəm',
    types: ['number', 'range'] as ColumnType[]
  },
  {
    title: 'Seçim',
    types: ['select', 'checkbox', 'radio'] as ColumnType[]
  },
  {
    title: 'Tarix/Vaxt',
    types: ['date', 'time', 'datetime'] as ColumnType[]
  },
  {
    title: 'Digər',
    types: ['email', 'url', 'phone', 'color', 'password'] as ColumnType[]
  },
  {
    title: 'Media',
    types: ['file', 'image'] as ColumnType[]
  }
];

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ value, onChange }) => {
  const getIconComponent = (iconName: string) => {
    return (Icons as any)[iconName] || Icons.circle;
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {typeGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">{group.title}</div>
          {group.types.map((type) => {
            const isActive = value === type;
            const typeInfo = columnTypeDefinitions[type];
            const IconComponent = getIconComponent(typeInfo.icon);
            
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange(type)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <IconComponent className="h-4 w-4" />
                <div className="flex-1">
                  <div>{typeInfo.label}</div>
                  <div className="text-xs opacity-70">{typeInfo.description}</div>
                </div>
                {isActive && <CheckIcon className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ColumnTypeSelector;
