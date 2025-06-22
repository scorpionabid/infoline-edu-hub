import { useState, useEffect } from 'react';

/**
 * Custom hook for media queries
 * @param query Media query string
 * @returns Boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state with the current match value
    setMatches(media.matches);

    // Create an event listener that updates the state
    const listener = () => setMatches(media.matches);
    
    // Attach the event listener to know when the matches value changes
    media.addEventListener('change', listener);
    
    // Remove the event listener on cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};