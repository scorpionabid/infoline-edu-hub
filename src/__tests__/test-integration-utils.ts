/**
 * İnfoLine İnteqrasiya Test Yardımçıları
 * 
 * Bu fayl, inteqrasiya testləri üçün istifadə edilə biləcək ümumi yardımçı 
 * funksiyaları və utilləri təqdim edir. Bunlar inteqrasiya testləri zamanı
 * ortaq funksionallıqları təmin edir və test kodunda təkrarlanmanı azaldır.
 */

import { vi } from 'vitest';
import { render } from '@testing-library/react';

// İstifadəçi rolu tip tərifi
type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Mock funksiyalar və test verilənləri
const mockUsePermissions = vi.fn();
const mockNavigate = vi.fn();
const mockUseToast = vi.fn();

// Supabase mocku
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  data: null,
  error: null
};

// Edge Functions mocku
const mockEdgeFunctions = {
  invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
};

// Hooks və contextlər üçün mock implementasiyalar
vi.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => mockUsePermissions()
}));

// Rəqəmsal məlumat ID nümunələri üçün yardımçı dəyişənlər
let testEntryId: string = 'test-entry-id-1';
let testCategoryId: string = 'test-category-id-1';
let testSchoolId: string = 'test-school-id-1';
let testSectorId: string = 'test-sector-id-1';
let testRegionId: string = 'test-region-id-1';

/**
 * Render funksional test yardımçısı
 * 
 * Bu funksiya bir render funksionalıdır amma TypeScript xatalarından qaçmaq üçün sadalaşəbilir
 */
export function renderForTest(Component: any, props: any = {}) {
  return render(Component(props));
}

/**
 * İstifadəçi rolunu moklayan funksiya
 * @param role İstifadəçi rolu
 */
export const mockUserRole = (role: UserRole = 'superadmin') => {
  mockUsePermissions.mockReturnValue({
    userRole: role,
    isSuperAdmin: role === 'superadmin',
    isRegionAdmin: role === 'regionadmin',
    isSectorAdmin: role === 'sectoradmin',
    isSchoolAdmin: role === 'schooladmin',
    regionId: testRegionId,
    sectorId: testSectorId,
    schoolId: testSchoolId
  });
};

/**
 * Test iyerarxiyasını quran funksiya
 * @returns Yaradılmış region, sektor və məktəb ID-ləri
 */
export const setupTestHierarchy = async () => {
  // Test üçün region, sektor və məktəb ID-ləri təyin edirik
  return {
    regionId: testRegionId,
    sectorId: testSectorId,
    schoolId: testSchoolId
  };
};

/**
 * Test istifadəçilərini yaratma funksiyası
 * @param hierarchy Iyerarxiya məlumatları
 * @returns Yaradılmış istifadəçilər
 */
export const setupTestUsers = async (hierarchy: any) => {
  // Test istifadəçiləri yaradırıq
  return {
    schoolAdmin: { id: 'school-admin-id', role: 'schooladmin', school_id: hierarchy.schoolId },
    sectorAdmin: { id: 'sector-admin-id', role: 'sectoradmin', sector_id: hierarchy.sectorId },
    regionAdmin: { id: 'region-admin-id', role: 'regionadmin', region_id: hierarchy.regionId }
  };
};

/**
 * Test kateqoriyaları və sütunlar yaratma funksiyası
 * @returns Yaradılmış kateqoriyalar
 */
export const setupTestCategories = async () => {
  // Test kateqoriyaları yaradırıq
  testCategoryId = 'test-category-id';
  return [
    { 
      id: testCategoryId, 
      name: 'Test Kateqoriya',
      columns: [
        { id: 'col1', name: 'Müəllim sayı', order: 1, type: 'number', required: true },
        { id: 'col2', name: 'Şagird sayı', order: 2, type: 'number', required: true },
        { id: 'col3', name: 'Kompüter sayı', order: 3, type: 'number', required: false }
      ]
    }
  ];
};

/**
 * Test məlumatlarını təmizləmə funksiyası
 */
export const cleanupTestData = async () => {
  // Test məlumatlarını təmizləyirik
  testEntryId = '';
};

/**
 * Test istifadəçilərini təmizləmə funksiyası
 */
export const cleanupTestUsers = async () => {
  // Test istifadəçilərini təmizləyirik
};

/**
 * Test iyerarxiyasını təmizləmə funksiyası
 */
export const cleanupTestHierarchy = async () => {
  // Test region, sektor və məktəblərini təmizləyirik
  testRegionId = '';
  testSectorId = '';
  testSchoolId = '';
};

/**
 * Müəyyən rol ilə giriş simulyasiya edən funksiya
 * @param role İstifadəçi rolu
 * @param options Əlavə parametrlər (region, sektor və məktəb ID-ləri)
 */
export const loginAs = async (role: UserRole, options: any = {}) => {
  // Müəyyən rol ilə giriş simulyasiya edirik
  mockUserRole(role);
  
  // Test options-da regionId, sectorId, schoolId varsa onları uyğun dəyişənlərə mənimsədirik
  if (options.regionId) {
    testRegionId = options.regionId;
  }
  if (options.sectorId) {
    testSectorId = options.sectorId;
  }
  if (options.schoolId) {
    testSchoolId = options.schoolId;
  }
};

/**
 * Məlumat sinxronizasiyası üçün gözləmə funksiyası
 */
export const waitForDataSync = async () => {
  // Məlumat sinxronizasiyası üçün gözləmə
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Üzerinə yaza biləcəyimiz yardımçı funksiyalar test dataEntryForm və zəruri interfeyslər

/**
 * Test məlumat forması doldurma funksiyası
 * @param formElement Form elementi
 * @param values Dəyərlər
 */
export const fillDataForm = async (formElement: HTMLElement, values: Record<string, string>) => {
  // Formanı doldururuq
  for (const [key, value] of Object.entries(values)) {
    const input = formElement.querySelector(`[name="${key}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }
  }
};

/**
 * Test məlumat forması təsdiqləmə funksiyası
 * @param formElement Form elementi
 */
export const submitDataForm = async (formElement: HTMLElement) => {
  // Formanı təsdiqləyirik
  const submitButton = formElement.querySelector('[type="submit"]') as HTMLButtonElement;
  if (submitButton) {
    submitButton.click();
  }
};

/**
 * Test məlumat forması saxlama funksiyası
 * @param formElement Form elementi
 */
export const saveDataForm = async (formElement: HTMLElement) => {
  // Formanı saxlayırıq
  const saveButton = formElement.querySelector('[data-action="save"]') as HTMLButtonElement;
  if (saveButton) {
    saveButton.click();
  }
};

/**
 * Məlumat təsdiqləmə funksiyası
 * @param entryId Məlumat ID-si
 */
export const approveData = async (entryId: string) => {
  // Məlumatı təsdiqləyirik
  testEntryId = entryId;
};

/**
 * Məlumat geri qaytarma funksiyası
 * @param entryId Məlumat ID-si
 * @param reason Səbəb
 */
export const returnData = async (entryId: string, reason: string) => {
  // Məlumatı geri qaytarırıq
  testEntryId = entryId;
};

/**
 * Məlumat ID-sinə görə əldə etmə funksiyası
 * @param entryId Məlumat ID-si
 */
export const fetchDataById = async (entryId: string) => {
  // Məlumatı ID-yə görə əldə edirik
  return {
    id: entryId,
    category_id: testCategoryId,
    school_id: testSchoolId,
    status: 'draft',
    values: {
      'Müəllim sayı': '25',
      'Şagird sayı': '450',
      'Kompüter sayı': '15'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Gözləyən məlumatları əldə etmə funksiyası
 */
export const fetchPendingData = async () => {
  // Gözləyən məlumatları əldə edirik
  return [
    {
      id: testEntryId,
      category_id: testCategoryId,
      school_id: testSchoolId,
      status: 'submitted',
      values: {
        'Müəllim sayı': '25',
        'Şagird sayı': '450',
        'Kompüter sayı': '15'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Sektor təsdiqlənmiş məlumatları əldə etmə funksiyası
 */
export const fetchSectorApprovedData = async () => {
  // Sektor təsdiqlənmiş məlumatları əldə edirik
  return [
    {
      id: testEntryId,
      category_id: testCategoryId,
      school_id: testSchoolId,
      status: 'sector_approved',
      values: {
        'Müəllim sayı': '25',
        'Şagird sayı': '450',
        'Kompüter sayı': '15'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

/**
 * Navigasiya funksiyası
 * @param path Hədəf yol
 */
export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
};

// Test üçün ortaq sabitlər
export const TestConstants = {
  // Test şablonları
  Templates: {
    DataEntry: {
      id: 'template-id',
      name: 'Test Şablonu',
      fields: [
        { id: 'field1', name: 'Alan 1', type: 'text', required: true },
        { id: 'field2', name: 'Alan 2', type: 'number', required: true },
        { id: 'field3', name: 'Alan 3', type: 'select', options: ['Seçim 1', 'Seçim 2'], required: false }
      ]
    }
  },
  
  // Test məlumatları
  TestData: {
    DataEntry: {
      'Alan 1': 'Test Dəyər',
      'Alan 2': '123',
      'Alan 3': 'Seçim 1'
    }
  },
  
  // Test status dəyərləri
  Status: {
    Draft: 'draft',
    Submitted: 'submitted',
    SectorApproved: 'sector_approved',
    RegionApproved: 'region_approved',
    Returned: 'returned',
    Rejected: 'rejected'
  }
};

/**
 * Mock və yardımçı funksiyaları export edirik
 */
export {
  mockSupabase,
  mockEdgeFunctions,
  mockNavigate,
  mockUseToast
};

// Export default olaraq mockUserRole funksiyasını veririk
export default mockUserRole;
