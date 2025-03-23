
export interface Report {
  id: string;
  title: string;
  type: 'statistics' | 'completion' | 'comparison';
  description: string;
  created: string;
  data: any[];
  summary: string;
  insights: string[];
  recommendations: string[];
}

export interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  schoolCode?: string;  // Yeni əlavə olundu
  region?: string;      // Yeni əlavə olundu
  sector?: string;      // Yeni əlavə olundu
  columnData: {
    columnId: string;
    value: any;
  }[];
}

export interface ExportOptions {
  includeHeaders?: boolean;
  customFileName?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
  includeSchoolInfo?: boolean;
  format?: 'xlsx' | 'csv' | 'txt';
  filterColumns?: string[];
}
