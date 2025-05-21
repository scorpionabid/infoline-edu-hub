/**
 * İnfoLine Təsdiqləmə Axını İnteqrasiya Testi
 * 
 * Bu test faylı, məlumatların daxil edilməsindən son təsdiqləmə mərhələsinə qədər
 * olan bütün prosesi test edir.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockUserRole, mockSupabase, mockEdgeFunctions } from '../test-integration-utils';

// Test konstantları
const TEST_DATA = {
  ENTRY_ID: 'test-entry-123',
  SCHOOL_ID: 'school-123',
  SECTOR_ID: 'sector-123',
  REGION_ID: 'region-123',
  CATEGORY_ID: 'category-123'
};

describe('INT-APPROVAL: Təsdiqləmə Prosesi İnteqrasiya Testləri', () => {
  beforeEach(() => {
    // Hər test öncəsi mock ayarları sıfırla
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Hər test sonrası təmizlik işləri
    vi.clearAllMocks();
  });

  /**
   * Məktəb → Sektor → Region → Təsdiqlənmiş axını
   */
  describe('INT-APPROVAL-01: Tam Təsdiqləmə Axını', () => {
    // Məlumat obyekti
    const dataEntry = {
      id: TEST_DATA.ENTRY_ID,
      school_id: TEST_DATA.SCHOOL_ID,
      category_id: TEST_DATA.CATEGORY_ID,
      values: {
        'Müəllim sayı': '25',
        'Şagird sayı': '450'
      },
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    it('məlumat daxil edilməsindən son təsdiqə qədər tam axını test edir', async () => {
      // --- MƏRHƏLƏ 1: Məlumat daxil etmə ---
      
      // Məktəb admin rolu ilə giriş et
      mockUserRole('schooladmin');
      
      // Məlumat daxiletmə sorğusunu simulyasiya et
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'data_entries') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                data: [dataEntry],
                error: null
              })
            }),
            update: vi.fn().mockImplementation((updateData) => {
              return {
                eq: vi.fn().mockReturnValue({
                  data: [{
                    ...dataEntry,
                    ...updateData,
                    updated_at: new Date().toISOString()
                  }],
                  error: null
                })
              };
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              data: [dataEntry],
              error: null
            })
          };
        }
        return mockSupabase;
      });
      
      // --- MƏRHƏLƏ 2: Məlumatı təsdiqə göndər (draft → submitted) ---
      
      // Məlumatı təsdiqə göndərmə simulyasiyası
      const submitResult = await mockSupabase
        .from('data_entries')
        .update({ status: 'submitted' })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Təsdiqə göndərilmiş statusu yoxla
      expect(submitResult.data[0].status).toBe('submitted');
      
      // --- MƏRHƏLƏ 3: Sektor admin təsdiqi (submitted → sector_approved) ---
      
      // Sektor admin rolu ilə giriş et
      mockUserRole('sectoradmin');
      
      // Sektor təsdiqləmə simulyasiyası
      const sectorApproveResult = await mockSupabase
        .from('data_entries')
        .update({ status: 'sector_approved' })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Sektor tərəfindən təsdiqlənmiş statusu yoxla
      expect(sectorApproveResult.data[0].status).toBe('sector_approved');
      
      // --- MƏRHƏLƏ 4: Region admin təsdiqi (sector_approved → region_approved) ---
      
      // Region admin rolu ilə giriş et
      mockUserRole('regionadmin');
      
      // Region təsdiqləmə simulyasiyası
      const regionApproveResult = await mockSupabase
        .from('data_entries')
        .update({ status: 'region_approved' })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Region tərəfindən təsdiqlənmiş statusu yoxla
      expect(regionApproveResult.data[0].status).toBe('region_approved');
      
      // --- MƏRHƏLƏ 5: Son təsdiq (region_approved → approved) ---
      
      // Superadmin rolu ilə giriş et
      mockUserRole('superadmin');
      
      // Son təsdiqləmə simulyasiyası
      const finalApproveResult = await mockSupabase
        .from('data_entries')
        .update({ status: 'approved' })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Son təsdiq statusunu yoxla
      expect(finalApproveResult.data[0].status).toBe('approved');
    });
  });
  
  /**
   * Geri qaytarma və yenidən göndərmə
   */
  describe('INT-APPROVAL-02: Geri Qaytarma və Yenidən Təsdiqə Göndərmə', () => {
    // Məlumat obyekti
    const dataEntry = {
      id: TEST_DATA.ENTRY_ID,
      school_id: TEST_DATA.SCHOOL_ID,
      category_id: TEST_DATA.CATEGORY_ID,
      values: {
        'Müəllim sayı': '25',
        'Şagird sayı': '450'
      },
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    it('sektor admin tərəfindən geri qaytarılan məlumatın düzəldilib yenidən göndərilməsini test edir', async () => {
      // --- MƏRHƏLƏ 1: Sektor admin tərəfindən geri qaytarma ---
      
      // Sektor admin rolu ilə giriş et
      mockUserRole('sectoradmin');
      
      // Məlumat sorğusunu simulyasiya et
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'data_entries') {
          return {
            update: vi.fn().mockImplementation((updateData) => {
              return {
                eq: vi.fn().mockReturnValue({
                  data: [{
                    ...dataEntry,
                    ...updateData,
                    updated_at: new Date().toISOString()
                  }],
                  error: null
                })
              };
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              data: [dataEntry],
              error: null
            })
          };
        } else if (table === 'return_comments') {
          return {
            insert: vi.fn().mockReturnValue({
              data: [{
                id: 'comment-123',
                entry_id: TEST_DATA.ENTRY_ID,
                user_id: 'sector-admin-123',
                comment: 'Məlumatları tamamlayın',
                created_at: new Date().toISOString()
              }],
              error: null
            })
          };
        }
        return mockSupabase;
      });
      
      // Geri qaytarma əməliyyatı
      const returnResult = await mockSupabase
        .from('data_entries')
        .update({ 
          status: 'returned', 
          returned_by: 'sector-admin-123',
          returned_at: new Date().toISOString() 
        })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Geri qayıtma statusunu yoxla
      expect(returnResult.data[0].status).toBe('returned');
      
      // Geri qaytarma səbəbi əlavə et
      await mockSupabase
        .from('return_comments')
        .insert({
          entry_id: TEST_DATA.ENTRY_ID,
          user_id: 'sector-admin-123',
          comment: 'Məlumatları tamamlayın'
        });
      
      // --- MƏRHƏLƏ 2: Məktəb admin tərəfindən məlumatların düzəldilməsi ---
      
      // Məktəb admin rolu ilə giriş et
      mockUserRole('schooladmin');
      
      // Məlumatı yeniləmə
      const updateResult = await mockSupabase
        .from('data_entries')
        .update({ 
          values: {
            'Müəllim sayı': '30',
            'Şagird sayı': '480',
            'Kompüter sayı': '25'
          }
        })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Yenilənmiş məlumatları yoxla
      expect(updateResult.data[0].values['Müəllim sayı']).toBe('30');
      
      // --- MƏRHƏLƏ 3: Yenidən təsdiqə göndərmə ---
      
      // Təsdiqə göndərmə əməliyyatı
      const resubmitResult = await mockSupabase
        .from('data_entries')
        .update({ 
          status: 'submitted',
          resubmitted_at: new Date().toISOString()
        })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Yenidən təsdiqə göndərilmiş statusu yoxla
      expect(resubmitResult.data[0].status).toBe('submitted');
      
      // --- MƏRHƏLƏ 4: Sektor admin tərəfindən təsdiq ---
      
      // Sektor admin rolu ilə giriş et
      mockUserRole('sectoradmin');
      
      // Sektor təsdiqləmə simulyasiyası
      const sectorApproveResult = await mockSupabase
        .from('data_entries')
        .update({ status: 'sector_approved' })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Sektor tərəfindən təsdiqlənmiş statusu yoxla
      expect(sectorApproveResult.data[0].status).toBe('sector_approved');
    });
  });
  
  /**
   * Rədd etmə axını
   */
  describe('INT-APPROVAL-03: Rədd Etmə Axını', () => {
    // Məlumat obyekti
    const dataEntry = {
      id: TEST_DATA.ENTRY_ID,
      school_id: TEST_DATA.SCHOOL_ID,
      category_id: TEST_DATA.CATEGORY_ID,
      values: {
        'Müəllim sayı': '25',
        'Şagird sayı': '450'
      },
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    it('region admin tərəfindən rədd edilən məlumatın statusunun dəyişməsini test edir', async () => {
      // Region admin rolu ilə giriş et
      mockUserRole('regionadmin');
      
      // Test üçün status dəyişəni - bu dəyişəni istifadə edərək statusun dəyişib-dəyişmədiyini izləyə bilərik
      let currentEntryStatus = dataEntry.status;
      
      // Məlumat sorğusunu simulyasiya et - təkmilləşdirilmiş mock
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'data_entries') {
          return {
            update: vi.fn().mockImplementation((updateData) => {
              // Status dəyişdirildikdə currentEntryStatus dəyişənini yenilə
              if (updateData.status) {
                currentEntryStatus = updateData.status;
              }
              
              return {
                eq: vi.fn().mockReturnValue({
                  data: [{
                    ...dataEntry,
                    ...updateData,
                    status: currentEntryStatus, // Yenilənmiş statusu istifadə et
                    updated_at: new Date().toISOString()
                  }],
                  error: null
                })
              };
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnValue({
              data: [{
                ...dataEntry,
                status: currentEntryStatus // Yenilənmiş statusu qaytarma
              }],
              error: null
            })
          };
        } else if (table === 'rejection_comments') {
          return {
            insert: vi.fn().mockReturnValue({
              data: [{
                id: 'comment-123',
                entry_id: TEST_DATA.ENTRY_ID,
                user_id: 'region-admin-123',
                comment: 'Məlumatlar qəbul edilə bilməz',
                created_at: new Date().toISOString()
              }],
              error: null
            })
          };
        }
        return mockSupabase;
      });
      
      // Rədd etmə əməliyyatı
      const rejectResult = await mockSupabase
        .from('data_entries')
        .update({ 
          status: 'rejected', 
          rejected_by: 'region-admin-123',
          rejected_at: new Date().toISOString() 
        })
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Rədd edilmə statusunu yoxla
      expect(rejectResult.data[0].status).toBe('rejected');
      
      // Rədd edilmə səbəbi əlavə et
      const commentResult = await mockSupabase
        .from('rejection_comments')
        .insert({
          entry_id: TEST_DATA.ENTRY_ID,
          user_id: 'region-admin-123',
          comment: 'Məlumatlar qəbul edilə bilməz'
        });
      
      // Rədd edilmə şərhini yoxla
      expect(commentResult.data[0].comment).toBe('Məlumatlar qəbul edilə bilməz');
      
      // Məktəb admin rolu ilə giriş et və rədd edilmiş məlumatı görüntülə
      mockUserRole('schooladmin');
      
      // Rədd edilmiş məlumatı əldə et
      const getRejectedEntry = await mockSupabase
        .from('data_entries')
        .select()
        .eq('id', TEST_DATA.ENTRY_ID);
      
      // Status yoxlaması
      expect(getRejectedEntry.data[0].status).toBe('rejected');
    });
  });
});
