
import { Category } from "@/types/category";
import { Column } from "@/types/column";
import { FormItem } from "@/types/form";
import { Notification } from "@/types/notification";

export interface MockCategory extends Omit<Category, "archived" | "column_count"> {
  archived?: boolean;
  column_count?: number;
}

export interface MockColumn extends Omit<Column, "options"> {
  options?: any;
}

export interface MockFormItem extends Partial<FormItem> {
  id: string;
  title: string;
  status: string;
  completionPercentage: number;
  deadline: string;
}

export interface MockNotification extends Partial<Notification> {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}
