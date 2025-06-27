
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: boolean;
  timeout?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Yüklənir...", 
  progress = false,
  timeout = 10000 // 10 seconds default timeout
}) => {
  const [progressValue, setProgressValue] = useState(0);
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  useEffect(() => {
    if (!progress) return;
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 90) return prev; // Stop at 90% until actual completion
        return prev + Math.random() * 15;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [progress]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="w-16 h-16 relative mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      
      {progress && (
        <div className="w-64 h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progressValue, 100)}%` }}
          />
        </div>
      )}
      
      <p className="text-lg text-center max-w-xs mb-2">{message}</p>
      
      {timeoutReached && (
        <div className="text-center max-w-sm mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Yüklənmə gozləniləndən uzun çəkir...
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-primary hover:underline"
          >
            Səhifəni yenidən yüklə
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
