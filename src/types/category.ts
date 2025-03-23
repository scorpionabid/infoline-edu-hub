
export type Category = {
  id: string;
  name: string;
  assignment: "all" | "sectors";
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
  priority: number;
  archived?: boolean;
  description?: string; // Kateqoriya haqqında əlavə məlumat
  deadline?: string; // Son tarix
  columnCount?: number; // Kateqoriyaya aid sütunların sayı
};
