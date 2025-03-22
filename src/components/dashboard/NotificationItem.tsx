
import React from 'react';
import { Bell, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
  };
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { type, title, message, time } = notification;
  
  const getIcon = () => {
    switch(type) {
      case 'newCategory':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'formApproved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'formRejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'dueDateReminder':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'systemUpdate':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="flex items-start gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
