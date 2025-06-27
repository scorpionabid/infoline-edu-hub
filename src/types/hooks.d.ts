declare module '@/hooks/regions/useRegions' {
  export interface RegionData {
    id: string;
    name: string;
    code: string;
    created_at?: string;
  }

  export type UseRegionsResult = {
    regions: RegionData[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<RegionData[]>;
    filter: (query: string) => RegionData[];
    getById: (id: string) => RegionData | undefined;
  };

  export default function useRegions(): UseRegionsResult;
}
