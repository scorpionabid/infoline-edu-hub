
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  priority?: number;
  deadline?: string | Date;
  status?: string;
  columnCount?: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
