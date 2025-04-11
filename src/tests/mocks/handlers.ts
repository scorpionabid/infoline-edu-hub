
import { http, HttpResponse } from 'msw';

// API sorğuları üçün handlers
export const handlers = [
  // Auth ilə bağlı sorğular
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: '1',
        email: 'superadmin@test.com',
      }
    });
  }),

  // İstifadəçi rolları ilə bağlı sorğular
  http.get('*/rest/v1/user_roles*', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          user_id: '1',
          role: 'superadmin',
          region_id: null,
          sector_id: null,
          school_id: null
        }
      ]
    });
  }),

  // Test məlumatlarının əldə edilməsi üçün handlers burada əlavə edilə bilər
];
