
// Define the ReportTypeValues to include 'bar'
export type ReportTypeValues = 
  | 'bar' 
  | 'pie' 
  | 'line' 
  | 'area' 
  | 'table' 
  | 'summary' 
  | 'comparison';

export interface ReportChartProps {
  type: ReportTypeValues;
  data: any[];
  config?: any;
  title?: string;
  description?: string;
}
