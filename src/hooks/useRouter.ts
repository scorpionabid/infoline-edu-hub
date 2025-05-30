
import { useNavigate, useLocation } from 'react-router-dom';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: navigate,
    pathname: location.pathname,
    query: new URLSearchParams(location.search),
    back: () => navigate(-1)
  };
};
