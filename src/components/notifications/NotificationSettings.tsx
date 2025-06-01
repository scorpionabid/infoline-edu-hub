import React, { useState } from 'react';
import { 
  Settings, 
  Mail, 
  Bell, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useNotificationPreferences } from '@/hooks/notifications/useEnhancedNotifications';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  className
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { preferences, loading, updateEmailPreferences, updateDeadlinePreferences, updateDigestFrequency, toggleNotificationType } = useNotificationPreferences();
  
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local preferences when props change
  React.useEffect(() => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  }, [preferences]);

  const handleLocalChange = (key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleNestedChange = (parent: string, key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update email preferences
      if (localPreferences.email_enabled !== preferences.email_enabled ||
          JSON.stringify(localPreferences.category_preferences) !== JSON.stringify(preferences.category_preferences)) {
        await updateEmailPreferences({
          enabled: localPreferences.email_enabled,
          types: localPreferences.category_preferences || {}
        });
      }

      // Update deadline preferences
      if (localPreferences.deadline_reminders !== preferences.deadline_reminders) {
        await updateDeadlinePreferences(localPreferences.deadline_reminders);
      }

      // Update digest frequency
      if (localPreferences.digest_frequency !== preferences.digest_frequency) {
        await updateDigestFrequency(localPreferences.digest_frequency);
      }

      setHasChanges(false);
      toast({
        title: 'Tənzimləmələr yadda saxlandı',
        description: 'Bildiriş tənzimləmələriniz uğurla yeniləndi',
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Xəta',
        description: 'Tənzimləmələr yadda saxlana bilmədi',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const notificationTypes = [
    {
      key: 'deadlines',
      label: 'Son tarix xəbərdarlıqları',
      description: 'Məlumat daxil etmə müddətləri barədə xəbərdarlıqlar',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      key: 'approvals',
      label: 'Təsdiq bildirişləri',
      description: 'Məlumatların təsdiq və ya rədd edilməsi barədə',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      key: 'system',
      label: 'Sistem bildirişləri',
      description: 'Sistem yenilikləri və dəyişikliklər',
      icon: Info,
      color: 'text-blue-600'
    },
    {
      key: 'reminders',
      label: 'Xatırlatmalar',
      description: 'Məlumat daxil etmə xatırlatmaları',
      icon: Bell,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold">{t('notificationSettings')}</h3>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              {t('reset')}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-2 text-xs"
            >
              {saving ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-72 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Bildirişləri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email bildirişləri</Label>
                    <p className="text-xs text-muted-foreground">
                      Bildirişləri email olaraq alın
                    </p>
                  </div>
                  <Switch
                    checked={localPreferences.email_enabled ?? true}
                    onCheckedChange={(checked) => handleLocalChange('email_enabled', checked)}
                  />
                </div>

                <Separator />

                {/* Email types */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Email növləri</Label>
                  {notificationTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isEnabled = localPreferences.category_preferences?.[type.key] ?? true;
                    
                    return (
                      <div key={type.key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={cn("h-4 w-4", type.color)} />
                          <div className="space-y-0.5">
                            <Label className="text-sm">{type.label}</Label>
                            <p className="text-xs text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => 
                            handleNestedChange('category_preferences', type.key, checked)
                          }
                          disabled={!localPreferences.email_enabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Deadline Reminders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Son Tarix Xatırlatmaları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Xəbərdarlıq vaxtı</Label>
                  <Select
                    value={localPreferences.deadline_reminders || '3_1'}
                    onValueChange={(value) => handleLocalChange('deadline_reminders', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_1">3 gün və 1 gün əvvəl</SelectItem>
                      <SelectItem value="1">Yalnız 1 gün əvvəl</SelectItem>
                      <SelectItem value="none">Xəbərdarlıq istəmirəm</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Son tarixdən nə qədər əvvəl xəbərdarlıq almaq istədiyinizi seçin
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Digest Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Bildiriş Xülasəsi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Xülasə tezliyi</Label>
                  <Select
                    value={localPreferences.digest_frequency || 'daily'}
                    onValueChange={(value) => handleLocalChange('digest_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Dərhal göndər</SelectItem>
                      <SelectItem value="daily">Gündəlik xülasə</SelectItem>
                      <SelectItem value="weekly">Həftəlik xülasə</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Bildirişlərin nə vaxt email olaraq göndərilməsini istədiyinizi seçin
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications (Future feature) */}
            <Card className="opacity-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Push Bildirişləri
                  <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Tezliklə</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Brauzer bildirişləri</Label>
                    <p className="text-xs text-muted-foreground">
                      Brauzerdə pop-up bildirişlər göstər
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cari Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Email bildirişləri:</span>
                  <span className={cn(
                    "font-medium",
                    localPreferences.email_enabled ? "text-green-600" : "text-red-600"
                  )}>
                    {localPreferences.email_enabled ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Son tarix xəbərdarlıqları:</span>
                  <span className="font-medium">
                    {localPreferences.deadline_reminders === '3_1' ? '3+1 gün' :
                     localPreferences.deadline_reminders === '1' ? '1 gün' : 'Deaktiv'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Xülasə tezliyi:</span>
                  <span className="font-medium">
                    {localPreferences.digest_frequency === 'immediate' ? 'Dərhal' :
                     localPreferences.digest_frequency === 'daily' ? 'Gündəlik' : 'Həftəlik'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationSettings;
