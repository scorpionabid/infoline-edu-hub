
export interface ReportDataItem {
  name: string;
  value: number;
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
