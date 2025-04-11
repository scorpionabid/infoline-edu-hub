
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Əlavə custom matchers
expect.extend(toHaveNoViolations);
