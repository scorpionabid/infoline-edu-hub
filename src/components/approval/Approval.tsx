
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataEntryStatus } from '@/types/dataEntry';
import { PendingApproval } from '@/types/dashboard';
import { useAuth } from '@/context/auth';
import { UserRole } from '@/types/user.d.ts';
import { usePermissions } from '@/hooks/auth/usePermissions';
import PendingApprovalsTable from './PendingApprovalsTable';
import ApprovalItem from './ApprovalItem';

interface ApprovalProps {
  user?: any;
  userRole?: UserRole;
  permissions?: any;
}

interface ApprovalRecord extends PendingApproval {
  schoolName: string;
  categoryName: string;
  date: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Approval: React.FC<ApprovalProps> = ({ 
  user, 
  userRole, 
  permissions 
}) => {
  const { t } = useLanguage();
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockApprovals: ApprovalRecord[] = [
    {
      id: '1',
      schoolName: 'ABC İbtidai Məktəbi',
      categoryName: 'Müəllim Məlumatları',
      date: '2024-01-15',
      submittedAt: '2024-01-15',
      created_at: '2024-01-15T00:00:00Z',
      status: 'pending'
    },
    {
      id: '2',
      schoolName: 'XYZ Orta Məktəbi',
      categoryName: 'Şagird Nailiyyətləri',
      date: '2024-01-20',
      submittedAt: '2024-01-20',
      created_at: '2024-01-20T00:00:00Z',
      status: 'approved'
    },
    {
      id: '3',
      schoolName: '123 Liseyi',
      categoryName: 'Tədbir Planları',
      date: '2024-01-25',
      submittedAt: '2024-01-25',
      created_at: '2024-01-25T00:00:00Z',
      status: 'rejected'
    },
  ];

  useEffect(() => {
    setApprovals(mockApprovals);
  }, []);

  const totalPending = approvals.filter(item => item.status === 'pending').length;
  const totalApproved = approvals.filter(item => item.status === 'approved').length;
  const totalRejected = approvals.filter(item => item.status === 'rejected').length;

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(item =>
      item.id === id ? { ...item, status: 'approved' as const } : item
    ));
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.map(item =>
      item.id === id ? { ...item, status: 'rejected' as const } : item
    ));
  };

  const handleView = (id: string) => {
    console.log(`Viewing approval with id ${id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const filteredBySearch = approvals.filter(item =>
    item.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByStatus = selectedStatus === 'all' 
    ? approvals 
    : approvals.filter(item => item.status === selectedStatus);

  const combinedFiltered = filteredBySearch.filter(item =>
    selectedStatus === 'all' || item.status === selectedStatus
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingApprovals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder={t('searchBySchoolName')}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Select onValueChange={handleStatusChange} defaultValue={selectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="approved">{t('approved')}</SelectItem>
                  <SelectItem value="rejected">{t('rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalPending')}
                  </div>
                  <div className="text-2xl font-bold">{totalPending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalApproved')}
                  </div>
                  <div className="text-2xl font-bold">{totalApproved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('totalRejected')}
                  </div>
                  <div className="text-2xl font-bold">{totalRejected}</div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {combinedFiltered.map((approval) => (
                <ApprovalItem
                  key={approval.id}
                  approval={approval}
                  onApprove={() => handleApprove(approval.id)}
                  onReject={() => handleReject(approval.id)}
                  onView={() => handleView(approval.id)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approval;
