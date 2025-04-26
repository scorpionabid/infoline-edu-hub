
import { createContext, ReactNode } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
