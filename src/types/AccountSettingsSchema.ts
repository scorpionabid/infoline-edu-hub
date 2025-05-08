
import { z } from "zod";

export const AccountSettingsSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  language: z.string(),
  position: z.string().optional(),
  notification_settings: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    push: z.boolean(),
    system: z.boolean(),
    deadline: z.boolean()
  }).optional()
});

export type AccountSettingsFormValues = z.infer<typeof AccountSettingsSchema>;
