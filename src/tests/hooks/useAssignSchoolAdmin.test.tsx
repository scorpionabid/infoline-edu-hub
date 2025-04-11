
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import { useAssignExistingUserAsSchoolAdmin } from '@/hooks/useAssignExistingUserAsSchoolAdmin'; 
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'az',
    setLanguage: vi.fn()
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/hooks/useAssignExistingUserAsSchoolAdmin/api', () => ({
  assignSchoolAdminApi: vi.fn().mockImplementation(async (params) => {
    if (!params.schoolId || !params.userId) {
      return { success: false, error: 'Missing parameters' };
    }
    return { success: true, data: { schoolId: params.schoolId, userId: params.userId } };
  })
}));

// Mock the document dispatchEvent
const originalDispatchEvent = document.dispatchEvent;
const mockDispatchEvent = vi.fn();
document.dispatchEvent = mockDispatchEvent;

describe('useAssignExistingUserAsSchoolAdmin hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    document.dispatchEvent = originalDispatchEvent;
  });

  it('should return loading state and assignUserAsSchoolAdmin function', () => {
    const { result } = renderHook(() => useAssignExistingUserAsSchoolAdmin());
    
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.assignUserAsSchoolAdmin).toBe('function');
  });

  it('should successfully assign a user as school admin', async () => {
    const { result } = renderHook(() => useAssignExistingUserAsSchoolAdmin());
    
    const assignResult = await result.current.assignUserAsSchoolAdmin('school-123', 'user-456');
    
    expect(assignResult.success).toBe(true);
    expect(toast.success).toHaveBeenCalled();
    expect(mockDispatchEvent).toHaveBeenCalledTimes(2);
    expect(mockDispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'refresh-users' }));
    expect(mockDispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'refresh-schools' }));
  });

  it('should handle error when schoolId is missing', async () => {
    const { result } = renderHook(() => useAssignExistingUserAsSchoolAdmin());
    
    const assignResult = await result.current.assignUserAsSchoolAdmin('', 'user-456');
    
    expect(assignResult.success).toBe(false);
    expect(toast.error).toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });

  it('should handle error when userId is missing', async () => {
    const { result } = renderHook(() => useAssignExistingUserAsSchoolAdmin());
    
    const assignResult = await result.current.assignUserAsSchoolAdmin('school-123', '');
    
    expect(assignResult.success).toBe(false);
    expect(toast.error).toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });
});
