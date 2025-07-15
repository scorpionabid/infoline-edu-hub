import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from 'lucide-react';

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  deadline_notifications: boolean;
  approval_notifications: boolean;
  system_notifications: boolean;
  data_entry_notifications: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  timezone: string;
  priority_filter: string[];
  language: string;
  deadline_reminders: string;
  digest_frequency: string;
  category_preferences: Record<string, any>;
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    sms_enabled: false,
    deadline_notifications: true,
    approval_notifications: true,
    system_notifications: true,
    data_entry_notifications: true,
    daily_digest: false,
    weekly_digest: false,
    timezone: 'Asia/Baku',
    priority_filter: ['normal', 'high', 'critical'],
    language: 'az',
    deadline_reminders: '3_1',
    digest_frequency: 'immediate',
    category_preferences: {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      // API call simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bildiriş Kanalları</CardTitle>
          <CardDescription>
            Bildirişlərin hansı kanallarla göndərilməsini seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">E-poçt bildirişləri</Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('email_enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push bildirişləri</Label>
            <Switch
              id="push-notifications"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('push_enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app-notifications">Tətbiq içi bildirişlər</Label>
            <Switch
              id="in-app-notifications"
              checked={preferences.in_app_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('in_app_enabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS bildirişləri</Label>
            <Switch
              id="sms-notifications"
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('sms_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildiriş Növləri</CardTitle>
          <CardDescription>
            Hansı növ bildirişləri almaq istədiyinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="deadline-notifications">Müddət bildirişləri</Label>
            <Switch
              id="deadline-notifications"
              checked={preferences.deadline_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('deadline_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="approval-notifications">Təsdiq bildirişləri</Label>
            <Switch
              id="approval-notifications"
              checked={preferences.approval_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('approval_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="system-notifications">Sistem bildirişləri</Label>
            <Switch
              id="system-notifications"
              checked={preferences.system_notifications}
              onCheckedChange={(checked) => handlePreferenceChange('system_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Müddət Xatırlatmaları</CardTitle>
          <CardDescription>
            Deadline xatırlatmalarının vaxtını təyin edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">3 gün qalmış xatırlatma</p>
                <p className="text-xs text-muted-foreground">Erkən xəbərdarlıq</p>
              </div>
              <div className="text-right">
                {preferences.deadline_reminders && ['3_1'].includes(preferences.deadline_reminders) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 text-gray-300">○</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">1 gün qalmış xatırlatma</p>
                <p className="text-xs text-muted-foreground">Son xəbərdarlıq</p>
              </div>
              <div className="text-right">
                {preferences.deadline_reminders ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 text-gray-300">○</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}