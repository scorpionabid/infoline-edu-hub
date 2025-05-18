
import { createContext } from 'react';
import { AuthContextType } from '@/types/auth';

// Create the context with proper typing
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
