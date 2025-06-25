
import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UserFormData } from "@/types/user";

interface NotificationSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  form,
  data,
  onFormChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("notificationSettings")}</h3>
      
      <FormField
        control={form.control}
        name="email_notifications"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <FormLabel>{t("emailNotifications")}</FormLabel>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  onFormChange("email_notifications", checked);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="push_notifications"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between">
            <FormLabel>{t("pushNotifications")}</FormLabel>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  onFormChange("push_notifications", checked);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default NotificationSection;
