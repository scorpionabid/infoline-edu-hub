
import { Region } from '@/types/supabase';

export const mockRegions: Region[] = [
  { 
    id: 'r1', 
    name: 'Bakı', 
    description: 'Bakı şəhəri', 
    status: 'active',
    admin_id: 'u1',
    admin_email: 'admin@baku.edu.az'
  },
  { 
    id: 'r2', 
    name: 'Sumqayıt', 
    description: 'Sumqayıt şəhəri', 
    status: 'active',
    admin_id: 'u2',
    admin_email: 'admin@sumgayit.edu.az'
  },
  { 
    id: 'r3', 
    name: 'Gəncə', 
    description: 'Gəncə şəhəri', 
    status: 'active',
    admin_id: 'u3', 
    admin_email: 'admin@ganja.edu.az'
  },
  { 
    id: 'r4', 
    name: 'Lənkəran', 
    description: 'Lənkəran şəhəri', 
    status: 'active',
    admin_id: 'u4',
    admin_email: 'admin@lankaran.edu.az'
  },
  { 
    id: 'r5', 
    name: 'Mingəçevir', 
    description: 'Mingəçevir şəhəri', 
    status: 'active',
    admin_id: 'u5',
    admin_email: 'admin@mingachevir.edu.az'
  }
];
