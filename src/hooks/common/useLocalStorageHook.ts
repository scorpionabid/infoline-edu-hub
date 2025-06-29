import { useState, useEffect, useCallback, useRef } from 'react';

type StorageValue<T> = T | null;

/**
 * Advanced hook for managing local storage values with cross-tab synchronization
 * Fixed version to prevent infinite loops
 * @param key - Local storage key
 * @param initialValue - Default value if key doesn't exist in local storage
 * @returns Tuple with current value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use ref to store the key to prevent infinite loops when key changes
  const keyRef = useRef(key);
  keyRef.current = key;

  // Function to get stored value from localStorage or return initialValue
  const readValue = useCallback((): T => {
    try {
      // Check if window is defined (for SSR)
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(keyRef.current);
      return item ? (parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${keyRef.current}":`, error);
      return initialValue;
    }
  }, [initialValue]); // Only depend on initialValue

  // State to store our value - initialize with readValue
  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  // Function to update stored value in localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prevStoredValue) => {
          const valueToStore = value instanceof Function ? value(prevStoredValue) : value;
          
          // Check if window is defined (for SSR)
          if (typeof window !== 'undefined') {
            // Save to localStorage
            window.localStorage.setItem(keyRef.current, JSON.stringify(valueToStore));
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${keyRef.current}":`, error);
      }
    },
    [] // No dependencies needed since we use refs and callbacks
  );

  // Update state when storage events occur on other tabs
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === keyRef.current && e.storageArea === localStorage) {
        // Get new value from other tab
        const newValue = e.newValue ? parseJSON(e.newValue) as T : initialValue;
        setStoredValue(newValue);
      }
    }

    // Listen for changes to localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    // Cleanup listener on unmount
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [initialValue]); // Only depend on initialValue

  // Initial read on mount - only once
  useEffect(() => {
    const currentValue = readValue();
    setStoredValue(prev => {
      // Only update if the value is actually different
      return JSON.stringify(prev) !== JSON.stringify(currentValue) ? currentValue : prev;
    });
  }, []); // Empty dependency array - only run on mount

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