import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for media queries - optimized to prevent infinite loops
 * @param query Media query string
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  // Use ref to store query to prevent infinite re-renders when query changes
  const queryRef = useRef(query);
  queryRef.current = query;

  // Initialize state with current match value
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(queryRef.current);
    
    // Update the state with the current match value
    setMatches(media.matches);

    // Create an event listener that updates the state
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    // Use the modern addEventListener if available, fallback to addListener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }
    
    // Cleanup function
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, []); // Empty dependency array - query changes are handled via ref

  return matches;
};