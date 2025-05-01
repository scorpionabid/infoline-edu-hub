
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { NotificationsCardProps } from '@/types/dashboard';

export function NotificationsCard({ 
  title, 
  notifications 
}: NotificationsCardProps) {
  // Notification icon based on type
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[300px]">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Bildiriş yoxdur
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                {index > 0 && <Separator className="my-2" />}
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium ${notification.isRead ? 'text-muted-foreground' : ''}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">{notification.date}</span>
                    </div>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
