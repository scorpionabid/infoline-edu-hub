
export interface SectorApprovalItem {
  id: string;
  sectorName: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  submittedBy: string;
  completionRate: number;
  sectorId: string;
  categoryId: string;
  entries: any[];
}
