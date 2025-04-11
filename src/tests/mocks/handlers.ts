
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

  // Supabase edge function-larını mock etmək üçün
  http.post('*/functions/v1/assign-existing-user-as-school-admin', async ({ request }) => {
    const body = await request.json();
    
    if (!body.userId || !body.schoolId) {
      return HttpResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }
    
    return HttpResponse.json({
      success: true,
      data: { 
        userId: body.userId,
        schoolId: body.schoolId,
        role: 'schooladmin'
      }
    });
  }),
];
