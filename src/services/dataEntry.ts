
export interface SaveFormDataOptions {
  categoryId: string;
  schoolId: string;
  status: 'draft' | 'pending';
}

export class DataEntryService {
  static async saveFormData(formData: Record<string, any>, options: SaveFormDataOptions) {
    // Mock implementation for now
    console.log('Saving form data:', formData, options);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          success: true
        });
      }, 1000);
    });
  }
}
