
// Mövcud tipləri qoruyuruq
import { ColumnType } from './column';

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  columnData: {
    columnId: string;
    value: string | number | boolean | null;
  }[];
}

export interface CategoryColumn {
  id: string;
  categoryId: string;
  name: string;
  type: ColumnType;
  order: number;
  status: "active" | "inactive";
  isRequired: boolean;
}

export interface ExportOptions {
  customFileName?: string;
  includeHeaders?: boolean;
  sheetName?: string;
  excludeColumns?: string[];
}
