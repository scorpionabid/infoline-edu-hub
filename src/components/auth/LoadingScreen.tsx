import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div 
        role="status"
        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
        aria-label="Yüklənir"
      ></div>
    </div>
  );
};

export default LoadingScreen;
