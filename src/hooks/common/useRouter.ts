import { useRouter as useNextRouter } from 'next/router';
import { useCallback } from 'react';

export const useRouter = () => {
  const router = useNextRouter();

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const navigateWithQuery = useCallback((path: string, query: Record<string, string>) => {
    router.push({
      pathname: path,
      query
    });
  }, [router]);

  return {
    ...router,
    navigate,
    navigateWithQuery
  };
};

export default useRouter;
