
export type FormStatus = "pending" | "approved" | "rejected" | "due" | "overdue" | "draft" | "empty" | "dueSoon";

export interface Form {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
}
