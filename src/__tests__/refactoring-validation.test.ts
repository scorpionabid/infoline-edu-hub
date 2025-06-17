
import { describe, it, expect } from 'vitest';
import { DataEntryService, SaveDataEntryOptions, SaveResult } from '@/services/dataEntry/dataEntryService';

describe('DataEntry Service Refactoring', () => {
  it('should maintain backward compatibility after refactoring', async () => {
    const formData = { field1: 'value1', field2: 'value2' };
    const options: SaveDataEntryOptions = {
      categoryId: 'cat-1',
      schoolId: 'school-1'
    };

    const result: SaveResult = await DataEntryService.saveFormData(formData, options);
    
    expect(result.success).toBe(true);
  });
});
