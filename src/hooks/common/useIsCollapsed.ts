import { useState } from 'react';

export const useIsCollapsed = (initialState = false) => {
  const [isCollapsed, setIsCollapsed] = useState(initialState);
  
  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };
  
  return {
    isCollapsed,
    toggleCollapsed,
    // setIsCollapsed
  };
};

export default useIsCollapsed;
