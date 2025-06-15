
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Filter, Search, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedNotificationContext } from '@/context/EnhancedNotificationContext';
import { AppNotification } from '@/types/notification';

export interface NotificationSystemProps {
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  enableRealtime?: boolean;
}

const EnhancedNotificationSystem: React.FC<NotificationSystemProps> = ({
  maxItems = 10,
  showFilters = true,
  showSearch = true,
  enableRealtime = true
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
    error
  } = useEnhancedNotificationContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.is_read) ||
      (filterStatus === 'unread' && !notification.is_read);

    return matchesSearch && matchesType && matchesStatus;
  }).slice(0, maxItems);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'approval': return '✅';
      case 'submission': return '📄';
      case 'system': return '⚙️';
      case 'warning': return '⚠️';
      default: return '📬';
    }
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Bildirişləri yükləyərkən xəta baş verdi: {typeof error === 'string' ? error : 'Naməlum xəta'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Bildirişlər</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              Hamısını oxunmuş et
            </Button>
          )}
        </div>
        
        {showSearch && (
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Bildirişlərdə axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {showFilters && (
          <div className="flex items-center space-x-2 mt-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamısı</SelectItem>
                <SelectItem value="deadline">Müddət</SelectItem>
                <SelectItem value="approval">Təsdiq</SelectItem>
                <SelectItem value="submission">Göndəriş</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
                <SelectItem value="warning">Xəbərdarlıq</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamısı</SelectItem>
                <SelectItem value="unread">Oxunmamış</SelectItem>
                <SelectItem value="read">Oxunmuş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading && notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Bildirişlər yüklənir...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Axtarış nəticəsində bildiriş tapılmadı'
              : 'Hələ ki bildiriş yoxdur'
            }
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                  notification.is_read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getTypeIcon(notification.type || 'info')}</span>
                      <h4 className={`font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(notification.priority || 'normal')}
                      >
                        {notification.priority || 'normal'}
                      </Badge>
                    </div>
                    
                    {notification.message && (
                      <p className={`text-sm mb-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at || notification.createdAt || '').toLocaleString('az-AZ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedNotificationSystem;
