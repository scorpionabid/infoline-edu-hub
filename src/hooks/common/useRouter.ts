
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    push: navigate,
    pathname: location.pathname,
    query: params,
    back: () => window.history.back()
  };
};

export default useRouter;
