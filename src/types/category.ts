
export type Category = {
  id: string;
  name: string;
  assignment: "all" | "sectors";
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive" | "pending" | "approved" | "rejected" | "dueSoon" | "overdue";
  priority: number;
  archived?: boolean;
  description?: string; // Kateqoriya haqqında əlavə məlumat
  deadline?: string; // Son tarix
  columnCount?: number; // Kateqoriyaya aid sütunların sayı
};

export type CategoryFilter = {
  search: string;
  status: 'active' | 'inactive' | '';
  showArchived: boolean;
  assignment: 'all' | 'sectors' | '';
};
