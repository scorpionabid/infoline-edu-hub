// This is a simplified version of the dashboard types file just to add the missing properties
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  // Add missing properties
  totalEntries?: number;
  pendingEntries?: number;
  pendingCount?: number;
}
