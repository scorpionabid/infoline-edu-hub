
// This is a simplified version of the dashboard types file just to add the missing properties
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  lastUpdate?: string;
  pendingCount?: number;
  pendingEntries?: number;
  totalEntries?: number;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}
