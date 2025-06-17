
import React from 'react';
import { TranslationWrapper } from './TranslationWrapper';

export function withTranslation<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    minimal?: boolean;
  }
) {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <TranslationWrapper 
        fallback={options?.fallback}
        minimal={options?.minimal}
      >
        <Component {...props} />
      </TranslationWrapper>
    );
  };

  WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default withTranslation;
