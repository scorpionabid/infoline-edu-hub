
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface StatusCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatusCard = ({
  title,
  value,
  description,
  icon,
  className = '',
  variant = 'default',
}: StatusCardProps) => {
  const variantClasses = {
    default: 'bg-card border-border',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const valueClasses = {
    default: 'text-foreground',
    success: 'text-green-800',
    warning: 'text-orange-800',
    danger: 'text-red-800',
    info: 'text-blue-800',
  };

  return (
    <Card className={`${variantClasses[variant]} ${className}`}>
      <CardContent className="p-4 flex items-center space-x-4">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className={`text-2xl font-bold ${valueClasses[variant]}`}>
            {value}
          </div>
          {description && <p className="text-xs mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export const StatusCardRow = ({
  cards,
  className = '',
}: {
  cards: StatusCardProps[];
  className?: string;
}) => {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {cards.map((card, index) => (
        <StatusCard key={index} {...card} />
      ))}
    </div>
  );
};

interface StatusCardsProps {
  items: StatusCardProps[];
}

const StatusCards: React.FC<StatusCardsProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <StatusCard
          key={index}
          title={item.title}
          value={item.value}
          description={item.description}
          icon={item.icon}
          variant={item.variant}
        />
      ))}
    </div>
  );
};

export default StatusCards;
