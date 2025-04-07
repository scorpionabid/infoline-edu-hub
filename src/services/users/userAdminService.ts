
import { getUser } from './userFetchService';

// İstifadəçinin admin funksiyaları üçün müəssisəsini müəyyən et
export const getAdminEntity = async (userId: string): Promise<any> => {
  try {
    const user = await getUser(userId);
    if (!user) return null;
    
    return user.adminEntity;
  } catch (error) {
    console.error('Admin entity məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};
