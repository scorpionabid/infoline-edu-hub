
// Mock hook for test compatibility
import { useState } from 'react';

export const useQuickWins = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return {
    data,
    loading,
    error: null,
    fetchQuickWins: () => Promise.resolve([])
  };
};

export default useQuickWins;
