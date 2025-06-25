/**
 * NotificationPreferences UI Component
 * İstifadəçi notification ayarları üçün interface
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Settings, 
  TestTube,
  RotateCcw,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNotificationPreferences } from '@/notifications';
import { useAuthStore, selectUser } from '@/hooks/auth';
import { toast } from 'sonner';

interface NotificationPreferencesProps {
  userId?: string;
  showStats?: boolean;
  className?: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId: propUserId,
  showStats = true,
  className = ''
}) => {
  const user = useAuthStore(selectUser);
  const userId = propUserId || user?.id;
  
  const {
    preferences,
    stats,
    isLoading,
    toggleEmailNotifications,
    togglePushNotifications,
    updateDeadlineReminders,
    updateDigestFrequency,
    resetToDefaults,
    sendTestNotification,
    isUpdating,
    isTestingNotification,
    canReceiveEmail,
    canReceivePush,
    deadlineRemindersEnabled
  } = useNotificationPreferences(userId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences || !userId) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Notification Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Notification ayarları yüklənə bilmir.</p>
        </CardContent>
      </Card>
    );
  }

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success('Test bildirişi göndərildi!');
    } catch (error) {
      toast.error('Test bildirişi göndərilərkən xəta baş verdi');
    }
  };

  const handleResetToDefaults = async () => {
    try {
      await resetToDefaults();
      toast.success('Ayarlar default vəziyyətə qaytarıldı');
    } catch (error) {
      toast.error('Ayarlar sıfırlanarkən xəta baş verdi');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Ayarları
              </CardTitle>
              <CardDescription>
                Aldığınız bildirişləri və onların çatdırılma üsulunu idarə edin
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isTestingNotification}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isTestingNotification ? 'Göndərilir...' : 'Test Bildirişi'}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Sıfırla
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ayarları sıfırlamaq istədiyinizə əminsiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu əməliyyat bütün notification ayarlarınızı default vəziyyətə qaytaracaq.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İmtina</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetToDefaults}>
                      Bəli, sıfırla
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Ümumi</TabsTrigger>
              <TabsTrigger value="channels">Kanallar</TabsTrigger>
              <TabsTrigger value="timing">Vaxtlama</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Bildirişləri
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Email vasitəsilə bildirişlər alın
                    </p>
                  </div>
                  <Switch
                    checked={canReceiveEmail}
                    onCheckedChange={toggleEmailNotifications}
                    disabled={isUpdating}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Push Bildirişləri
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Brauzer bildirişləri alın
                    </p>
                  </div>
                  <Switch
                    checked={canReceivePush}
                    onCheckedChange={togglePushNotifications}
                    disabled={isUpdating}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Son Tarix Xatırlatmaları
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Son tarix yaxınlaşdıqda nə vaxt xatırlatma almaq istəyirsiniz
                  </p>
                  <Select
                    value={preferences.deadline_reminders}
                    onValueChange={(value: '3_1' | '1' | 'none') => updateDeadlineReminders(value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_1">3 gün və 1 gün qalmış</SelectItem>
                      <SelectItem value="1">Yalnız 1 gün qalmış</SelectItem>
                      <SelectItem value="none">Xatırlatma göndərmə</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className={canReceiveEmail ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                      {canReceiveEmail && <Badge variant="secondary" className="text-xs">Aktiv</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      Əhəmiyyətli bildirişlər üçün ən etibarlı kanal
                    </p>
                    <Switch
                      checked={canReceiveEmail}
                      onCheckedChange={toggleEmailNotifications}
                      disabled={isUpdating}
                    />
                  </CardContent>
                </Card>

                <Card className={canReceivePush ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Push Bildirişləri
                      {canReceivePush && <Badge variant="secondary" className="text-xs">Aktiv</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      Dərhal alınacaq brauzer bildirişləri
                    </p>
                    <Switch
                      checked={canReceivePush}
                      onCheckedChange={togglePushNotifications}
                      disabled={isUpdating}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Bildiriş Tezliyi</Label>
                  <p className="text-sm text-muted-foreground">
                    Bildirişləri nə qədər tez-tez almaq istəyirsiniz
                  </p>
                  <Select
                    value={preferences.digest_frequency}
                    onValueChange={(value: 'immediate' | 'daily' | 'weekly') => updateDigestFrequency(value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Dərhal</SelectItem>
                      <SelectItem value="daily">Gündəlik xülasə</SelectItem>
                      <SelectItem value="weekly">Həftəlik xülasə</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base">Son Tarix Ayarları</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">3 gün qalmış xatırlatma</p>
                        <p className="text-xs text-muted-foreground">İlkin xəbərdarlıq</p>
                      </div>
                      <div className="text-right">
                        {deadlineRemindersEnabled && ['3_1'].includes(preferences.deadline_reminders) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">1 gün qalmış xatırlatma</p>
                        <p className="text-xs text-muted-foreground">Son xəbərdarlıq</p>
                      </div>
                      <div className="text-right">
                        {deadlineRemindersEnabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Statistics */}
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Notification Statistikası
            </CardTitle>
            <CardDescription>
              Son statistikalarınız
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ümumi</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Oxunmamış</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bu gün</p>
                <p className="text-2xl font-bold text-green-600">{stats.today || 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Bu həftə</p>
                <p className="text-2xl font-bold text-orange-600">{stats.thisWeek || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationPreferences;
