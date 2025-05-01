
import React from 'react';
import { SuperAdminDashboardData } from '@/types/supabase';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Super Admin İdarə Paneli</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500">Regionlar</h3>
          <p className="text-2xl font-bold">{data.regionCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500">Sektorlar</h3>
          <p className="text-2xl font-bold">{data.sectorCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500">Məktəblər</h3>
          <p className="text-2xl font-bold">{data.schoolCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-gray-500">İstifadəçilər</h3>
          <p className="text-2xl font-bold">{data.userCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">Son əlavə edilmiş regionlar</h3>
          {data.recentCategories && data.recentCategories.length > 0 ? (
            <ul className="space-y-2">
              {data.recentCategories.map((category, index) => (
                <li key={index} className="border-b pb-2">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Son əlavə edilmiş region yoxdur</p>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-2">Son bildirişlər</h3>
          {data.notifications && data.notifications.length > 0 ? (
            <ul className="space-y-2">
              {data.notifications.map((notification, index) => (
                <li key={index} className="border-b pb-2">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Yeni bildiriş yoxdur</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
