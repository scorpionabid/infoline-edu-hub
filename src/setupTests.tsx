
import { render } from '@testing-library/react';
import { ReactNode } from 'react';

export const createTestWrapper = (Component: React.ComponentType) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Component>{children}</Component>;
  };
};

export { render, screen, fireEvent } from '@testing-library/react';
export { vi } from 'vitest';
