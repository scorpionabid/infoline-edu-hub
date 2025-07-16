
import { useAuthStore, selectUser } from './useAuthStore';

export const useUser = () => {
  const user = useAuthStore(selectUser);
  const loading = useAuthStore(state => state.isLoading);
  
  return {
    user,
    loading
  };
};
