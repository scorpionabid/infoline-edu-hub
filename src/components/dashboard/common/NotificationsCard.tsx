
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsCardProps } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsCard({ title, notifications }: NotificationsCardProps) {
  const getNotificationTypeClass = (type?: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <li className="p-4 text-center text-muted-foreground">Bildiriş yoxdur</li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className={`p-4 ${!notification.isRead ? 'bg-muted/50' : ''}`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${getNotificationTypeClass(notification.type)}`} />
                  <div className="ml-3 flex-1">
                    <div className="font-medium">{notification.title}</div>
                    {notification.message && <p className="text-sm text-muted-foreground">{notification.message}</p>}
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
