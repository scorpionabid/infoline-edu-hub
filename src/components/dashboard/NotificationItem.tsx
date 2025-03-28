
import React from 'react';
import { Bell, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Notification } from '@/types/notification';

export interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { type, title, message, time } = notification;
  
  // Notification null və ya undefined isə, boş bir komponent göstər
  if (!notification) {
    console.warn('Notification is null or undefined in NotificationItem');
    return null;
  }
  
  const getIcon = () => {
    switch(type) {
      case 'newCategory':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'formApproved':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'formRejected':
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'dueDateReminder':
      case 'deadline':
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
