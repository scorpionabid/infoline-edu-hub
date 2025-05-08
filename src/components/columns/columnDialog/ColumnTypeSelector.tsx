
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { ColumnType } from '@/types/column';
import { Icons } from '@/components/ui/icons';

interface ColumnTypeSelectorProps {
  value: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;  // Added disabled prop
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

// Create a columnTypeDefinitions object
export const columnTypeDefinitions: Record<ColumnType, { label: string; description: string; icon: string }> = {
  text: { 
    label: 'Mətn', 
    description: 'Qısa mətn daxiletməsi', 
    icon: 'TextIcon' 
  },
  textarea: { 
    label: 'Mətn sahəsi', 
    description: 'Çoxsətirli mətn daxiletməsi', 
    icon: 'AlignLeftIcon' 
  },
  richtext: { 
    label: 'Zəngin mətn', 
    description: 'Formatlaşdırılmış mətn redaktoru', 
    icon: 'TypeIcon'
  },
  number: { 
    label: 'Rəqəm', 
    description: 'Rəqəm daxiletməsi', 
    icon: 'HashIcon' 
  },
  range: { 
    label: 'Aralıq', 
    description: 'Min və max aralığında rəqəm', 
    icon: 'BarChartIcon' 
  },
  select: { 
    label: 'Açılan siyahı', 
    description: 'Açılan siyahıdan seçim', 
    icon: 'ListIcon' 
  },
  checkbox: { 
    label: 'Bayraq', 
    description: 'Bəli/xeyr seçimi', 
    icon: 'CheckSquareIcon' 
  },
  radio: { 
    label: 'Radio düymələri', 
    description: 'Bir seçim variantı', 
    icon: 'CircleIcon' 
  },
  date: { 
    label: 'Tarix', 
    description: 'Tarix seçimi', 
    icon: 'CalendarIcon' 
  },
  time: { 
    label: 'Vaxt', 
    description: 'Vaxt seçimi', 
    icon: 'ClockIcon' 
  },
  datetime: { 
    label: 'Tarix və vaxt', 
    description: 'Tarix və vaxt seçimi', 
    icon: 'CalendarRangeIcon' 
  },
  email: { 
    label: 'E-poçt', 
    description: 'E-poçt ünvanı daxiletməsi', 
    icon: 'MailIcon' 
  },
  url: { 
    label: 'URL', 
    description: 'Vebsayt ünvanı', 
    icon: 'LinkIcon' 
  },
  phone: { 
    label: 'Telefon', 
    description: 'Telefon nömrəsi', 
    icon: 'PhoneIcon' 
  },
  color: { 
    label: 'Rəng', 
    description: 'Rəng seçimi', 
    icon: 'PaletteIcon' 
  },
  password: { 
    label: 'Şifrə', 
    description: 'Gizli şifrə daxiletməsi', 
    icon: 'LockIcon' 
  },
  file: { 
    label: 'Fayl', 
    description: 'Fayl yükləməsi', 
    icon: 'FileIcon' 
  },
  image: { 
    label: 'Şəkil', 
    description: 'Şəkil yükləməsi', 
    icon: 'ImageIcon' 
  }
};

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ 
  value, 
  onChange,
  disabled = false  // Default value
}) => {
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
                onClick={() => !disabled && onChange(type)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted",
                  disabled && "opacity-50 cursor-not-allowed"
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
