
// Common utility hooks
import useBreakpoint from './useBreakpoint';
import useDebounce from './useDebounce';
import useDebounceCallback from './useDebounceCallback';
import useFiltering from './useFiltering';
import useInterval from './useInterval';
import useIsCollapsed from './useIsCollapsed';
import useLocalStorage from './useLocalStorage';
import useMediaQuery from './useMediaQuery';
import useMobile from './useMobile';
import useRouter from './useRouter';
import { useToast } from './useToast';
import useTranslation, { useLanguage } from './useTranslation';
import useCachedQuery, { invalidateCache, clearAllCaches } from './useCachedQuery';

// Barrel export all hooks
export {
  useBreakpoint,
  useDebounce,
  useDebounceCallback,
  useFiltering,
  useInterval,
  useIsCollapsed,
  useLocalStorage,
  useMediaQuery,
  useMobile,
  useRouter,
  useToast,
  useTranslation,
  useLanguage,
  useCachedQuery,
  invalidateCache,
  clearAllCaches
};

// Default exports for backward compatibility
export default {
  useBreakpoint,
  useDebounce,
  useDebounceCallback,
  useFiltering,
  useInterval,
  useIsCollapsed,
  useLocalStorage,
  useMediaQuery,
  useMobile,
  useRouter,
  useToast,
  useTranslation,
  useLanguage,
  useCachedQuery,
  invalidateCache,
  clearAllCaches
};
