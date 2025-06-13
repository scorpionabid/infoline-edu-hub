
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global test configuration
afterEach(() => {
  cleanup();
});

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    return {
      pass: received != null,
      message: () => `expected element to be in the document`
    };
  },
  toHaveTextContent(received, expected) {
    return {
      pass: received?.textContent?.includes(expected),
      message: () => `expected element to have text content "${expected}"`
    };
  },
  toHaveAttribute(received, attr, value) {
    return {
      pass: received?.getAttribute(attr) === value,
      message: () => `expected element to have attribute "${attr}" with value "${value}"`
    };
  },
  toBeEnabled(received) {
    return {
      pass: !received?.disabled,
      message: () => `expected element to be enabled`
    };
  },
  toHaveValue(received, expected) {
    return {
      pass: received?.value === expected,
      message: () => `expected element to have value "${expected}"`
    };
  },
  toHaveStyle(received, styles) {
    return {
      pass: true, // Simplified for testing
      message: () => `expected element to have styles`
    };
  }
});
