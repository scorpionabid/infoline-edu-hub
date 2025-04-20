
export interface ReportChartProps {
  report: {
    id: string;
    title: string;
    data: any;
  };
}

export interface ReportPreviewDialogProps {
  reportId: string;
  open: boolean;
  onClose: () => void;
}
