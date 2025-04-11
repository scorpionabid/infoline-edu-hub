
import { http, HttpResponse } from 'msw';
import { mockUsers } from './data/users';
import { mockCategories } from './data/categories';
import { mockSchools } from './data/schools';
import { mockRegions } from './data/regions';
import { mockSectors } from './data/sectors';

export const handlers = [
  // Auth handlers
  http.post('https://olbfnauhzpdskqnxtwav.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUsers[0]
    });
  }),
  
  // Users handlers
  http.get('https://olbfnauhzpdskqnxtwav.supabase.co/rest/v1/user_roles', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    if (userId) {
      const userRole = mockUsers.find(user => user.id === userId)?.role;
      if (userRole) {
        return HttpResponse.json([{ role: userRole }]);
      }
    }
    
    return HttpResponse.json(mockUsers.map(user => ({ user_id: user.id, role: user.role })));
  }),
  
  // Categories handlers
  http.get('https://olbfnauhzpdskqnxtwav.supabase.co/rest/v1/categories', () => {
    return HttpResponse.json(mockCategories);
  }),
  
  // Schools handlers
  http.get('https://olbfnauhzpdskqnxtwav.supabase.co/rest/v1/schools', () => {
    return HttpResponse.json(mockSchools);
  }),
  
  // Regions handlers
  http.get('https://olbfnauhzpdskqnxtwav.supabase.co/rest/v1/regions', () => {
    return HttpResponse.json(mockRegions);
  }),
  
  // Sectors handlers
  http.get('https://olbfnauhzpdskqnxtwav.supabase.co/rest/v1/sectors', () => {
    return HttpResponse.json(mockSectors);
  })
];
