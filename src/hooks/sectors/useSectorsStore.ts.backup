import { create } from 'zustand';
import { Sector } from '@/types/school';

interface SectorsState {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  setSectors: (sectors: Sector[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refetch: () => Promise<void>;
}

export const useSectorsStore = create<SectorsState>((set, get) => ({
  sectors: [],
  loading: false,
  error: null,
  setSectors: (sectors) => set({ sectors }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  refetch: async () => {
    // This will be implemented when needed
    console.log('Refetch called - implement actual fetch logic');
  }
}));

// For backwards compatibility
export const useSectors = () => {
  const { sectors, loading, refetch } = useSectorsStore();
  
  return {
    sectors,
    loading,
    refetch
  };
};
