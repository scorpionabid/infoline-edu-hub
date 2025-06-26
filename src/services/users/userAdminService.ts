
import { userFetchService } from './userFetchService';

// İstifadəçinin admin funksiyaları üçün müəssisəsini müəyyən et
export const getAdminEntity = async (userId: string): Promise<any> => {
  try {
    const user = await userFetchService.getUserById(userId);
    if (!user) return null;
    
    // Return admin entity based on user's role and assignments
    return {
      userId: user.id,
      role: user.role,
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id
    };
  } catch (error) {
    console.error('Admin entity məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};
