
export interface ReportDataItem {
  name: string;
  value: number | string;
  category: string;
  comparisonValue?: number;
}

export interface Report {
  id: string;
  title: string;
  type: string; // 'statistics' | 'completion' | 'comparison'
  description: string;
  created: string;
  data: ReportDataItem[];
  summary: string;
  insights?: string[];
  recommendations?: string[];
}

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
  name: string;
  type: string;
}
