
import React from 'react';

const LoginHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-primary rounded-lg text-white text-xl font-bold flex items-center justify-center">
          IL
        </div>
      </div>
      <h1 className="text-2xl font-bold mt-4">InfoLine</h1>
      <p className="text-muted-foreground mt-2">Məktəb Məlumatları Toplama Sistemi</p>
    </div>
  );
};

export default LoginHeader;
