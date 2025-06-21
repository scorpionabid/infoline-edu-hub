import React, { useState, useEffect } from 'react';

interface StatusItem {
  id: string;
  title: string;
  status: string;
}

const StatusHistoryDashboard: React.FC = () => {
  const [statusHistory, setStatusHistory] = useState<StatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setStatusHistory([
        { id: '1', title: 'Məlumatların Yoxlanılması', status: 'Tamamlandı' },
        { id: '2', title: 'Hesabatların Hazırlanması', status: 'Gözləmədə' },
        { id: '3', title: 'Təqdimatın Göndərilməsi', status: 'Ləğv edildi' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return <div>Yüklənir...</div>;
    }

    if (error) {
      return <div className="text-red-600">Xəta: {error}</div>;
    }

    // Return proper JSX content
    return (
      <div className="space-y-4">
        {statusHistory.map((item) => (
          <div key={item.id} className="border p-4 rounded">
            <h3>{item.title}</h3>
            <p>{item.status}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Status Tarixçəsi</h1>
      {renderContent()}
    </div>
  );
};

export default StatusHistoryDashboard;
