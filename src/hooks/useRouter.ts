
import { useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const push = useCallback(
    (path: string, state?: any) => {
      navigate(path, { state });
    },
    [navigate]
  );

  const replace = useCallback(
    (path: string, state?: any) => {
      navigate(path, { replace: true, state });
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    push,
    replace,
    goBack,
    params,
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    location,
    navigate
  };
};

export default useRouter;
