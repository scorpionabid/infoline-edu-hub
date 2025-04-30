
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './RegionAdminDashboard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardContent = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user) return;

        // İstifadəçinin rolunu əldə edirik
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Role fetch error:', error);
          return;
        }

        if (data) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [userRole, user]);

  const fetchDashboardData = async () => {
    if (!user || !userRole) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let data;
      
      // Role-a uyğun dashboard datanı əldə edirik
      if (userRole === 'superadmin') {
        // SuperAdmin üçün ümumi statistika
        const { data: superAdminData, error } = await supabase.functions.invoke('get-dashboard-data');
        
        if (error) throw error;
        
        data = superAdminData;
      } else if (userRole === 'regionadmin') {
        // Region admini üçün öz regionuna aid statistika
        const { data: regionData, error } = await supabase.functions.invoke('get-dashboard-data', {
          body: { role: 'regionadmin' }
        });
        
        if (error) throw error;
        
        data = regionData;
      } else if (userRole === 'sectoradmin') {
        // Sektor admini üçün öz sektoruna aid statistika
        const { data: sectorData, error } = await supabase.functions.invoke('get-sector-dashboard-data');
        
        if (error) throw error;
        
        data = sectorData;
      } else {
        // Məktəb admini üçün öz məktəbinə aid statistika
        const { data: schoolData, error } = await supabase.functions.invoke('get-dashboard-data', {
          body: { role: 'schooladmin' }
        });
        
        if (error) throw error;
        
        data = schoolData;
      }

      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dashboard məzmununu rola görə render edirik
  const renderDashboard = () => {
    if (!dashboardData) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Məlumat tapılmadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dashboard məlumatları hazırda əlçatan deyil.</p>
          </CardContent>
        </Card>
      );
    }

    switch (userRole) {
      case 'superadmin':
        return <SuperAdminDashboard data={dashboardData} onRefresh={fetchDashboardData} />;
      case 'regionadmin':
        return <RegionAdminDashboard data={dashboardData} />;
      case 'sectoradmin':
        // Sektor admin dashboardı
        return <RegionAdminDashboard data={dashboardData} />;
      case 'schooladmin':
        // Məktəb admin dashboardı
        return <RegionAdminDashboard data={dashboardData} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Məlumat tapılmadı</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Dashboard məlumatları hazırda əlçatan deyil.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Yenilə
        </Button>
      </div>
      {renderDashboard()}
    </div>
  );
};
