
import { ChartData } from 'recharts';
import { 
  RegionStat, 
  SectorStat, 
  SchoolStat,
  DashboardFormStats
} from '@/types/dashboard';

// Mock data for charts
export const schoolPerformanceData: ChartData[] = [
  { name: 'Tamamlanmış', value: 65, color: '#22c55e' },
  { name: 'Prosesdə', value: 25, color: '#f59e0b' },
  { name: 'Başlanmayıb', value: 10, color: '#a3a3a3' },
];

// Sample region stats
export const regionStats: RegionStat[] = [
  { id: '1', name: 'Bakı', completionRate: 85, sectorCount: 8, schoolCount: 120, status: 'active' },
  { id: '2', name: 'Sumqayıt', completionRate: 75, sectorCount: 5, schoolCount: 42, status: 'active' },
  { id: '3', name: 'Gəncə', completionRate: 68, sectorCount: 6, schoolCount: 38, status: 'active' },
  { id: '4', name: 'Mingəçevir', completionRate: 50, sectorCount: 2, schoolCount: 16, status: 'active' },
];

// Sample sector stats
export const sectorStats: SectorStat[] = [
  { id: '1', name: 'Binəqədi', completionRate: 90, schoolCount: 25, pendingApprovals: 2, status: 'active' },
  { id: '2', name: 'Sabunçu', completionRate: 75, schoolCount: 22, pendingApprovals: 8, status: 'active' },
  { id: '3', name: 'Yasamal', completionRate: 65, schoolCount: 18, pendingApprovals: 12, status: 'active' },
  { id: '4', name: 'Xətai', completionRate: 60, schoolCount: 15, pendingApprovals: 5, status: 'active' },
];

// Sample school stats
export const schoolStats: SchoolStat[] = [
  { id: '1', name: 'Məktəb #1', completionRate: 100, pendingCount: 0, status: 'active' },
  { id: '2', name: 'Məktəb #2', completionRate: 85, pendingCount: 2, status: 'active' },
  { id: '3', name: 'Məktəb #3', completionRate: 65, pendingCount: 5, status: 'active' },
  { id: '4', name: 'Məktəb #4', completionRate: 30, pendingCount: 12, status: 'active' },
];

// Sample form stats
export const formStats: DashboardFormStats = {
  total: 120,
  pending: 25,
  approved: 85,
  rejected: 10,
  dueSoon: 15,
  overdue: 5
};
