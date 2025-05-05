
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  content: any;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  category?: string;
  filters?: Record<string, any>;
}

export type ReportType = 'bar' | 'pie' | 'line' | 'table' | 'summary';
