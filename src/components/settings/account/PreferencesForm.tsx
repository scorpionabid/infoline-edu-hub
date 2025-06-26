import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";
import {
  useAuthStore,
  selectUser,
  selectUpdateProfile,
} from "@/hooks/auth/useAuthStore";
import { NotificationSettings } from "@/types/settings";

const formSchema = z.object({
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(false),
  sms_notifications: z.boolean().default(false),
  notification_frequency: z
    .enum(["immediate", "daily", "weekly"])
    .default("immediate"),
  // UI-specific fields
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  push: z.boolean().default(false),
  sms: z.boolean().default(false),
  deadlineReminders: z.boolean().default(true),
  statusUpdates: z.boolean().default(true),
  weeklyReports: z.boolean().default(false),
  system: z.boolean().default(true),
  deadline: z.boolean().default(true),
});

const PreferencesForm = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const updateProfile = useAuthStore(selectUpdateProfile);

  const defaultValues: NotificationSettings = {
    email_notifications: true,
    sms_notifications: false,
    push_notifications: false,
    notification_frequency: "immediate",
    email: true,
    inApp: true,
    push: false,
    sms: false,
    deadlineReminders: true,
    statusUpdates: true,
    weeklyReports: false,
    system: true,
    deadline: true,
  };

  const form = useForm<NotificationSettings>({
    resolver: zodResolver(formSchema),
    defaultValues: (user?.preferences as NotificationSettings) || defaultValues,
  });

  const onSubmit = async (data: NotificationSettings) => {
    try {
      await updateProfile({ preferences: data });
      toast.success(t("preferencesUpdated"));
    } catch (error) {
      toast.error(t("errorUpdatingPreferences"));
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notificationPreferences")}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {t("notificationChannels")}
              </h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormDescription>
                        {t("emailNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inApp"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("inApp")}</FormLabel>
                      <FormDescription>
                        {t("inAppNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("system")}</FormLabel>
                      <FormDescription>
                        {t("systemNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("deadline")}</FormLabel>
                      <FormDescription>
                        {t("deadlineNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="push"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("push")}</FormLabel>
                      <FormDescription>
                        {t("pushNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        // disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sms"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("sms")}</FormLabel>
                      <FormDescription>
                        {t("smsNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        // disabled
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("notificationTypes")}</h3>

              <FormField
                control={form.control}
                name="deadlineReminders"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("deadlineReminders")}</FormLabel>
                      <FormDescription>
                        {t("deadlineRemindersDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("statusUpdates")}</FormLabel>
                      <FormDescription>
                        {t("statusUpdatesDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weeklyReports"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div>
                      <FormLabel>{t("weeklyReports")}</FormLabel>
                      <FormDescription>
                        {t("weeklyReportsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">{t("saveChanges")}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PreferencesForm;
