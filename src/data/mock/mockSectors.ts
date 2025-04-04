
import { Sector } from '@/types/supabase';

export const mockSectors: Sector[] = [
  { 
    id: 's1', 
    name: 'Binəqədi', 
    region_id: 'r1', 
    description: 'Binəqədi rayonu', 
    status: 'active',
    admin_id: 's1-admin',
    admin_email: 'admin@binagadi.edu.az'
  },
  { 
    id: 's2', 
    name: 'Nəsimi', 
    region_id: 'r1', 
    description: 'Nəsimi rayonu', 
    status: 'active',
    admin_id: 's2-admin',
    admin_email: 'admin@nasimi.edu.az'
  },
  { 
    id: 's3', 
    name: 'Yasamal', 
    region_id: 'r1', 
    description: 'Yasamal rayonu', 
    status: 'active',
    admin_id: 's3-admin',
    admin_email: 'admin@yasamal.edu.az'
  },
  { 
    id: 's4', 
    name: 'Sumqayıt 1', 
    region_id: 'r2', 
    description: 'Sumqayıt şəhəri, sektor 1', 
    status: 'active',
    admin_id: 's4-admin',
    admin_email: 'admin@sumgayit1.edu.az'
  },
  { 
    id: 's5', 
    name: 'Sumqayıt 2', 
    region_id: 'r2', 
    description: 'Sumqayıt şəhəri, sektor 2', 
    status: 'active',
    admin_id: 's5-admin',
    admin_email: 'admin@sumgayit2.edu.az'
  },
  { 
    id: 's6', 
    name: 'Gəncə 1', 
    region_id: 'r3', 
    description: 'Gəncə şəhəri, sektor 1', 
    status: 'active',
    admin_id: 's6-admin',
    admin_email: 'admin@ganja1.edu.az' 
  }
];
