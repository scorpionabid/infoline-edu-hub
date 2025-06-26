
import { userFetchService } from './userFetchService';

// İstifadəçinin admin funksiyaları üçün müəssisəsini müəyyən et
export const getAdminEntity = async (userId: string): Promise<any> => {
  try {
    const user = await userFetchService.getUserById(userId);
    if (!user) return null;
    
    return user.adminEntity;
  } catch (error) {
    console.error('Admin entity məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};
