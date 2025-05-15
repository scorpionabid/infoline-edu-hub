
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  return {
    pathname: location.pathname,
    query: {
      ...Object.fromEntries(searchParams.entries()),
      ...params,
    },
    location,
    navigate,
    params,
    searchParams,
    push: navigate,
    back: () => navigate(-1),
  };
}

export default useRouter;
