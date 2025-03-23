
export type FormStatus = "pending" | "approved" | "rejected" | "due" | "overdue" | "draft" | "empty";

export interface Form {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
}
