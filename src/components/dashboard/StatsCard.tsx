
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  School, 
  Layers, 
  CheckCircle,
  FileCheck 
} from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string | React.ReactNode;
  description?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changeValue?: string;
  color?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon,
  description,
  changeType,
  changeValue,
  color,
  onClick
}) => {
  // İkon seçimi
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    switch (icon) {
      case 'region':
        return <Building className="h-8 w-8 text-blue-500" />;
      case 'sector':
        return <Layers className="h-8 w-8 text-purple-500" />;
      case 'school':
        return <School className="h-8 w-8 text-orange-500" />;
      case 'user':
        return <Users className="h-8 w-8 text-green-500" />;
      case 'approval':
        return <FileCheck className="h-8 w-8 text-amber-500" />;
      case 'completion':
        return <CheckCircle className="h-8 w-8 text-teal-500" />;
      default:
        return <Building className="h-8 w-8 text-slate-500" />;
    }
  };
  
  // Dəyişiklik tipi üçün rəng və işarə
  const getChangeTypeIndicator = () => {
    if (!changeType || !changeValue) return null;
    
    const indicatorClasses = {
      increase: 'text-green-500',
      decrease: 'text-red-500',
      neutral: 'text-gray-500',
    };
    
    const indicators = {
      increase: '↑',
      decrease: '↓',
      neutral: '•',
    };
    
    return (
      <span className={`text-sm font-medium ${indicatorClasses[changeType]}`}>
        {indicators[changeType]} {changeValue}
      </span>
    );
  };
  
  const cardClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';
  
  return (
    <Card className={cardClasses} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {getChangeTypeIndicator()}
          </div>
          <div className="flex items-start">
            {renderIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
