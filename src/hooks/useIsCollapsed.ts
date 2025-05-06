
import { useState } from 'react';

export const useIsCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };
  
  return {
    isCollapsed,
    toggleCollapse,
    setIsCollapsed
  };
};

export default useIsCollapsed;
