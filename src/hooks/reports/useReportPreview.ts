
import { useState } from 'react';

export const useReportPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const openPreview = (data: any) => {
    setReportData(data);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
    setReportData(null);
  };

  return {
    isOpen,
    reportData,
    openPreview,
    // closePreview
  };
};
