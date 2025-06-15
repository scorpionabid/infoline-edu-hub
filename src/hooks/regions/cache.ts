
import { EnhancedRegion } from '@/types/region';

// Global cache to prevent unnecessary fetches
let REGIONS_CACHE: EnhancedRegion[] | null = null;
let isRegionsFetchInProgress = false;

export const getRegionsCache = () => REGIONS_CACHE;

export const setRegionsCache = (regions: EnhancedRegion[] | null) => {
  REGIONS_CACHE = regions;
};

export const isFetchInProgress = () => isRegionsFetchInProgress;

export const setFetchInProgress = (isLoading: boolean) => {
  isRegionsFetchInProgress = isLoading;
};

export const clearCache = () => {
  REGIONS_CACHE = null;
};
