export interface School {
  id: string;
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  status: string;
  type: string;
  language: string;
  createdAt: string;
  completionRate: number;
  region: string;
  sector: string;
  logo: string;
  adminEmail?: string;
}

export interface SchoolFormData {
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: string;
  teacherCount: string;
  status: string;
  type: string;
  language: string;
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus?: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Sector {
  id: string;
  regionId: string;
  name: string;
}

export const mockSchools: School[] = [
  {
    "id": "1",
    "name": "Bakı şəhəri 1 nömrəli tam orta məktəb",
    "principalName": "Rəna Məmmədova",
    "address": "Bakı, Nəsimi rayonu, Mirəli Qaşqay küçəsi",
    "regionId": "baki",
    "sectorId": "nesimi",
    "phone": "+994124405060",
    "email": "baki1mekteb@edu.az",
    "studentCount": 1200,
    "teacherCount": 120,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-01-15",
    "completionRate": 75,
    "region": "Bakı",
    "sector": "Nəsimi",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "rena.mammadova@edu.az"
  },
  {
    "id": "2",
    "name": "Sumqayıt şəhəri 2 nömrəli tam orta məktəb",
    "principalName": "Elşən Quliyev",
    "address": "Sumqayıt, 1-ci mikrorayon",
    "regionId": "sumqayit",
    "sectorId": "sumqayit_merkez",
    "phone": "+994502203040",
    "email": "sumqayit2mekteb@edu.az",
    "studentCount": 1050,
    "teacherCount": 110,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-02-20",
    "completionRate": 68,
    "region": "Sumqayıt",
    "sector": "Sumqayıt Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "elshan.quliyev@edu.az"
  },
  {
    "id": "3",
    "name": "Gəncə şəhəri 3 nömrəli tam orta məktəb",
    "principalName": "Aytən Əliyeva",
    "address": "Gəncə, Şəhər 3",
    "regionId": "gence",
    "sectorId": "gence_merkez",
    "phone": "+994553304050",
    "email": "gence3mekteb@edu.az",
    "studentCount": 900,
    "teacherCount": 95,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-03-25",
    "completionRate": 72,
    "region": "Gəncə",
    "sector": "Gəncə Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "ayten.aliyeva@edu.az"
  },
  {
    "id": "4",
    "name": "Mingəçevir şəhəri 4 nömrəli tam orta məktəb",
    "principalName": "Rəşad Həsənov",
    "address": "Mingəçevir, Şəhər 4",
    "regionId": "mingecevir",
    "sectorId": "mingecevir_merkez",
    "phone": "+994704405060",
    "email": "mingecevir4mekteb@edu.az",
    "studentCount": 800,
    "teacherCount": 85,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-04-30",
    "completionRate": 65,
    "region": "Mingəçevir",
    "sector": "Mingəçevir Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "rashad.hasanov@edu.az"
  },
  {
    "id": "5",
    "name": "Naxçıvan şəhəri 5 nömrəli tam orta məktəb",
    "principalName": "Leyla İbrahimova",
    "address": "Naxçıvan, Şəhər 5",
    "regionId": "naxcivan",
    "sectorId": "naxcivan_merkez",
    "phone": "+994775506070",
    "email": "naxcivan5mekteb@edu.az",
    "studentCount": 700,
    "teacherCount": 75,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-05-05",
    "completionRate": 70,
    "region": "Naxçıvan",
    "sector": "Naxçıvan Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "leyla.ibrahimova@edu.az"
  },
  {
    "id": "6",
    "name": "Lənkəran şəhəri 6 nömrəli tam orta məktəb",
    "principalName": "Fərid Əliyev",
    "address": "Lənkəran, Şəhər 6",
    "regionId": "lenkeran",
    "sectorId": "lenkeran_merkez",
    "phone": "+994516607080",
    "email": "lenkeran6mekteb@edu.az",
    "studentCount": 650,
    "teacherCount": 70,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-06-10",
    "completionRate": 62,
    "region": "Lənkəran",
    "sector": "Lənkəran Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "farid.aliyev@edu.az"
  },
  {
    "id": "7",
    "name": "Yevlax şəhəri 7 nömrəli tam orta məktəb",
    "principalName": "Səbinə Məmmədova",
    "address": "Yevlax, Şəhər 7",
    "regionId": "yevlax",
    "sectorId": "yevlax_merkez",
    "phone": "+994557708090",
    "email": "yevlax7mekteb@edu.az",
    "studentCount": 600,
    "teacherCount": 65,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-07-15",
    "completionRate": 68,
    "region": "Yevlax",
    "sector": "Yevlax Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "sabina.mammadova@edu.az"
  },
  {
    "id": "8",
    "name": "Şəki şəhəri 8 nömrəli tam orta məktəb",
    "principalName": "Elvin Quliyev",
    "address": "Şəki, Şəhər 8",
    "regionId": "seki",
    "sectorId": "seki_merkez",
    "phone": "+994708809010",
    "email": "seki8mekteb@edu.az",
    "studentCount": 550,
    "teacherCount": 60,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-08-20",
    "completionRate": 72,
    "region": "Şəki",
    "sector": "Şəki Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "elvin.quliyev@edu.az"
  },
  {
    "id": "9",
    "name": "Quba şəhəri 9 nömrəli tam orta məktəb",
    "principalName": "Aygün Əliyeva",
    "address": "Quba, Şəhər 9",
    "regionId": "quba",
    "sectorId": "quba_merkez",
    "phone": "+994559901020",
    "email": "quba9mekteb@edu.az",
    "studentCount": 500,
    "teacherCount": 55,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-09-25",
    "completionRate": 65,
    "region": "Quba",
    "sector": "Quba Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "aygun.aliyeva@edu.az"
  },
  {
    "id": "10",
    "name": "Xaçmaz şəhəri 10 nömrəli tam orta məktəb",
    "principalName": "Ramil Həsənov",
    "address": "Xaçmaz, Şəhər 10",
    "regionId": "xacmaz",
    "sectorId": "xacmaz_merkez",
    "phone": "+994701102030",
    "email": "xacmaz10mekteb@edu.az",
    "studentCount": 450,
    "teacherCount": 50,
    "status": "active",
    "type": "full_secondary",
    "language": "az",
    "createdAt": "2023-10-30",
    "completionRate": 70,
    "region": "Xaçmaz",
    "sector": "Xaçmaz Mərkəz",
    "logo": "https://via.placeholder.com/50",
    "adminEmail": "ramil.hasanov@edu.az"
  }
];

export const mockSectors: Sector[] = [
  { id: 'nesimi', regionId: 'baki', name: 'Nəsimi' },
  { id: 'nizami', regionId: 'baki', name: 'Nizami' },
  { id: 'sabail', regionId: 'baki', name: 'Səbail' },
  { id: 'sumqayit_merkez', regionId: 'sumqayit', name: 'Sumqayıt Mərkəz' },
  { id: 'gence_merkez', regionId: 'gence', name: 'Gəncə Mərkəz' },
  { id: 'mingecevir_merkez', regionId: 'mingecevir', name: 'Mingəçevir Mərkəz' },
  { id: 'naxcivan_merkez', regionId: 'naxcivan', name: 'Naxçıvan Mərkəz' },
  { id: 'lenkeran_merkez', regionId: 'lenkeran', name: 'Lənkəran Mərkəz' },
  { id: 'yevlax_merkez', regionId: 'yevlax', name: 'Yevlax Mərkəz' },
  { id: 'seki_merkez', regionId: 'seki', name: 'Şəki Mərkəz' },
  { id: 'quba_merkez', regionId: 'quba', name: 'Quba Mərkəz' },
  { id: 'xacmaz_merkez', regionId: 'xacmaz', name: 'Xaçmaz Mərkəz' },
];

export const mockRegions: Region[] = [
  { id: 'baki', name: 'Bakı' },
  { id: 'sumqayit', name: 'Sumqayıt' },
  { id: 'gence', name: 'Gəncə' },
  { id: 'mingecevir', name: 'Mingəçevir' },
  { id: 'naxcivan', name: 'Naxçıvan' },
  { id: 'lenkeran', name: 'Lənkəran' },
  { id: 'yevlax', name: 'Yevlax' },
  { id: 'seki', name: 'Şəki' },
  { id: 'quba', name: 'Quba' },
  { id: 'xacmaz', name: 'Xaçmaz' },
];

export const getSchoolTypeLabel = (type: string): string => {
  switch (type) {
    case 'full_secondary':
      return 'Tam orta';
    case 'general_secondary':
      return 'Ümumi orta';
    case 'primary':
      return 'İbtidai';
    case 'lyceum':
      return 'Lisey';
    case 'gymnasium':
      return 'Gimnaziya';
    default:
      return 'Bilinmir';
  }
};

export const getLanguageLabel = (language: string): string => {
  switch (language) {
    case 'az':
      return 'Azərbaycan';
    case 'ru':
      return 'Rus';
    case 'en':
      return 'İngilis';
    case 'tr':
      return 'Türk';
    default:
      return 'Bilinmir';
  }
};

export const getSchoolInitial = (): SchoolFormData => ({
  name: '',
  principalName: '',
  address: '',
  regionId: '',
  sectorId: '',
  phone: '',
  email: '',
  studentCount: '',
  teacherCount: '',
  status: 'active',
  type: 'full_secondary',
  language: 'az',
  adminEmail: '',
  adminFullName: '',
  adminPassword: '',
  adminStatus: 'active'
});
