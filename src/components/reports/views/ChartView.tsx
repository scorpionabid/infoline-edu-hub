
import React from 'react';

interface ChartViewProps {
  data: Record<string, any>[];
  config?: Record<string, any>;
  type?: 'bar' | 'line' | 'pie';
}

const ChartView: React.FC<ChartViewProps> = ({ data, config, type = 'bar' }) => {
  if (data.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">Diaqram məlumatları yoxdur</div>;
  }
  
  return (
    <div className="h-[400px] flex items-center justify-center">
      <div className="text-muted-foreground text-center">
        <p>Diaqram komponenti hazırlanmaqdadır</p>
        <p className="text-xs mt-2">Tip: {type}</p>
        <p className="text-xs">Məlumat sayı: {data.length}</p>
      </div>
    </div>
  );
};

export default ChartView;
