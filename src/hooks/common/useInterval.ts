
import { useEffect, useRef } from 'react';

/**
 * Custom hook for setting intervals
 * @param callback Function to call on interval
 * @param delay Delay in milliseconds (null to pause)
 */
const useInterval = (callback: () => void, delay: number | null): void => {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
