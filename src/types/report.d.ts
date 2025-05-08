
export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  columnData: {
    columnId: string;
    columnName: string;
    value: string;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders?: boolean;
  fileName?: string;
}
