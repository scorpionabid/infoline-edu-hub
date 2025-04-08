
import React from 'react';

const BackgroundDecorations: React.FC = () => {
  return (
    <>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-bl-full -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-tr-full -z-10" />
    </>
  );
};

export default BackgroundDecorations;
