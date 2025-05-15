
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    navigate,
    push: navigate,
    replace: (path: string) => navigate(path, { replace: true }),
    location,
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    params,
    back: () => navigate(-1)
  };
};

export default useRouter;
