import { useState, useEffect, useCallback } from 'react';

type StorageValue<T> = T | null;

/**
 * Advanced hook for managing local storage values with cross-tab synchronization
 * @param key - Local storage key
 * @param initialValue - Default value if key doesn't exist in local storage
 * @returns Tuple with current value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Function to get stored value from localStorage or return initialValue
  const readValue = useCallback((): T => {
    try {
      // Check if window is defined (for SSR)
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? (parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Function to update stored value in localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function to conform to React.useState pattern
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Check if window is defined (for SSR)
        if (typeof window !== 'undefined') {
          // Save to localStorage
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          // Create and dispatch custom event for cross-tab synchronization
          const event = new StorageEvent('storage', {
            key: key,
            newValue: JSON.stringify(valueToStore),
            storageArea: localStorage,
            url: window.location.href
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [storedValue, key]
  );

  // Update state when storage events occur on other tabs
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key && e.storageArea === localStorage) {
        // Get new value from other tab
        const newValue = e.newValue ? parseJSON(e.newValue) as T : initialValue;
        // Update state only if it differs to avoid loop
        if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
          setStoredValue(newValue);
        }
      }
    }

    // Listen for changes to localStorage
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue, initialValue]);

  // Read stored value on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue];
}

// Helper function to safely parse JSON
function parseJSON<T>(value: string): T | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export default useLocalStorage;
