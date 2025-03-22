
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-l-4 ${color === 'blue' ? 'border-l-blue-500' : color === 'green' ? 'border-l-green-500' : color === 'amber' ? 'border-l-amber-500' : color === 'red' ? 'border-l-red-500' : 'border-l-purple-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <div className="text-2xl font-bold">{value}</div>
            </div>
            <div className={`p-2 rounded-full ${colorClasses[color]}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
