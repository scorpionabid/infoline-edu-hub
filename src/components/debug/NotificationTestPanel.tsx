import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBusinessNotifications } from '@/contexts/BusinessNotificationContext';
import { useNotificationContext } from '@/components/notifications/NotificationProvider';
import { useAuth } from '@/hooks/auth/useAuth';
import { NotificationService } from '@/services/api/notificationService';
import { DeadlineScheduler } from '@/services/notifications/scheduler/deadlineScheduler';
import { 
  Bell, 
  Send, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock,
  Info,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Notification Test Panel
 * Notification sistemini test etmək və demo üçün
 */
const NotificationTestPanel: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotificationContext();
  const businessNotifications = useBusinessNotifications();
  
  const [testType, setTestType] = useState<string>('custom');
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('Bu bir test notification-dır');
  const [notificationType, setNotificationType] = useState<string>('info');
  const [priority, setPriority] = useState<string>('normal');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTestNotification = async () => {
    if (!user?.id) {
      toast.error('İstifadəçi sistemə daxil olmayıb');
      return;
    }

    setIsLoading(true);
    try {
      switch (testType) {
        case 'custom':
          await NotificationService.createNotification({
            userId: user.id,
            title,
            message,
            type: notificationType as any,
            priority: priority as any
          });
          toast.success('Custom notification göndərildi!');
          break;

        case 'approval':
          await businessNotifications.notifyApprovalDecision(
            'mock-school-id',
            'mock-category-id',
            true
          );
          toast.success('Approval notification göndərildi!');
          break;

        case 'rejection':
          await businessNotifications.notifyApprovalDecision(
            'mock-school-id', 
            'mock-category-id',
            false,
            'Test rejection reason'
          );
          toast.success('Rejection notification göndərildi!');
          break;

        case 'deadline':
          await businessNotifications.sendDeadlineReminder('mock-category-id');
          toast.success('Deadline reminder göndərildi!');
          break;

        case 'data_submission':
          await businessNotifications.notifyDataSubmission(
            'mock-school-id',
            'mock-category-id',
            5
          );
          toast.success('Data submission notification göndərildi!');
          break;

        case 'completion':
          await businessNotifications.notifyCompletion(
            'mock-school-id',
            'mock-category-id'
          );
          toast.success('Completion notification göndərildi!');
          break;

        default:
          toast.error('Bilinməyən test növü');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Notification göndərilərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkTest = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Send multiple notifications quickly
      const promises = [
        NotificationService.createNotification({
          userId: user.id,
          title: 'Bulk Test 1',
          message: 'İlk bulk notification',
          type: 'info',
          priority: 'normal'
        }),
        NotificationService.createNotification({
          userId: user.id,
          title: 'Bulk Test 2', 
          message: 'İkinci bulk notification',
          type: 'success',
          priority: 'normal'
        }),
        NotificationService.createNotification({
          userId: user.id,
          title: 'Bulk Test 3',
          message: 'Üçüncü bulk notification',
          type: 'warning',
          priority: 'high'
        })
      ];

      await Promise.all(promises);
      toast.success('3 bulk notification göndərildi!');
    } catch (error) {
      toast.error('Bulk test xətası');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejection': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'deadline': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Notification Test Panel
          </CardTitle>
          <CardDescription>
            Real-time notification sistemini test etmək üçün panel
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cari Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <span>Ümumi: <Badge variant="outline">{notifications.length}</Badge></span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              <span>Oxunmamış: <Badge variant="destructive">{unreadCount}</Badge></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Sistem: <Badge variant="outline" className="text-green-600">Aktiv</Badge></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notification Göndər</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-type">Test Növü</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Notification</SelectItem>
                  <SelectItem value="approval">Approval Notification</SelectItem>
                  <SelectItem value="rejection">Rejection Notification</SelectItem>
                  <SelectItem value="deadline">Deadline Reminder</SelectItem>
                  <SelectItem value="data_submission">Data Submission</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {testType === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Notification Tipi</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioritet</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Yüksək</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Başlıq</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification başlığı"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Notification mesajı"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSendTestNotification}
              disabled={isLoading || !user}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Göndərilir...' : 'Test Göndər'}
            </Button>

            <Button 
              variant="outline"
              onClick={handleBulkTest}
              disabled={isLoading || !user}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Bulk Test (3x)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {testType === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {getTypeIcon(notificationType)}
                <div className="flex-1">
                  <h4 className="font-medium">{title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {notificationType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Təlimatları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. <strong>Test Notification göndər</strong> - Bell icon-da dərhal görməlisiniz</p>
            <p>2. <strong>Real-time</strong> - Sayı avtomatik artmalıdır</p>
            <p>3. <strong>Bulk Test</strong> - 3 notification eyni anda göndərir</p>
            <p>4. <strong>Bell Click</strong> - Dropdown-da yeni notifications görün</p>
            <p>5. <strong>Mobile Test</strong> - Mobil cihazda responsive olduğunu yoxlayın</p>
            <p>6. <strong>Mark as Read</strong> - Notification-ları oxunmuş işarələyin</p>
            <p>7. <strong>Filter Test</strong> - /notifications səhifəsində filterlər test edin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTestPanel;
