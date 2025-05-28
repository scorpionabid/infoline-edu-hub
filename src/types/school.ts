
export interface SchoolStat {
  id: string;
  name: string;
  completion_rate: number;
  completionRate: number;
  total_entries?: number;
  totalEntries?: number;
  pending_entries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  formsCompleted?: number;
  totalForms?: number;
  lastUpdate?: string;
  pendingForms?: number;
}

export function adaptToSchoolStat(data: any): SchoolStat {
  return {
    id: data.id,
    name: data.name,
    completion_rate: data.completion_rate || data.completionRate || 0,
    completionRate: data.completion_rate || data.completionRate || 0,
    total_entries: data.total_entries || data.totalEntries || 0,
    totalEntries: data.total_entries || data.totalEntries || 0,
    pending_entries: data.pending_entries || data.pendingEntries || data.pendingCount || 0,
    pendingEntries: data.pending_entries || data.pendingEntries || data.pendingCount || 0,
    pendingCount: data.pending_entries || data.pendingEntries || data.pendingCount || 0,
    approved_entries: data.approved_entries || 0,
    status: data.status || 'active',
    region_id: data.region_id,
    sector_id: data.sector_id,
    formsCompleted: data.formsCompleted || 0,
    totalForms: data.totalForms || 0,
    lastUpdate: data.lastUpdate,
    pendingForms: data.pendingForms || data.pendingCount || 0
  };
}
