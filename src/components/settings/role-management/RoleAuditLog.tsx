import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, RefreshCw, Search, User, Shield } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  action: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export const RoleAuditLog = () => {
  const { t } = useTranslation();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7days");

  const actions = [
    { value: 'assign_region_admin', label: 'Region Admin Təyini' },
    { value: 'assign_sector_admin', label: 'Sektor Admin Təyini' },
    { value: 'assign_school_admin', label: 'Məktəb Admin Təyini' },
    { value: 'role_change', label: 'Rol Dəyişikliyi' },
    { value: 'permission_change', label: 'Səlahiyyət Dəyişikliyi' },
    { value: 'user_create', label: 'İstifadəçi Yaradılması' },
    { value: 'user_delete', label: 'İstifadəçi Silinməsi' },
    { value: 'user_update', label: 'İstifadəçi Yenilənməsi' }
  ];

  const dateRanges = [
    { value: '1day', label: 'Son 24 saat' },
    { value: '7days', label: 'Son 7 gün' },
    { value: '30days', label: 'Son 30 gün' },
    { value: '90days', label: 'Son 90 gün' },
    { value: 'all', label: 'Bütün vaxt' }
  ];

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Calculate date filter
      let dateFilter = null;
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('days', '').replace('day', ''));
        const date = new Date();
        date.setDate(date.getDate() - days);
        dateFilter = date.toISOString();
      }

      // Build query
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!audit_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logsWithUserInfo = data?.map(log => ({
        ...log,
        user_name: log.profiles?.full_name,
        user_email: log.profiles?.email
      })) || [];

      setAuditLogs(logsWithUserInfo);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error(t('errorFetchingAuditLogs') || 'Audit jurnalını yükləməkdə xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [searchTerm, actionFilter, dateRange]);

  const getActionBadge = (action: string) => {
    const actionObj = actions.find(a => a.value === action);
    const label = actionObj?.label || action;
    
    let variant: "default" | "destructive" | "secondary" | "outline" = "default";
    
    if (action.includes('delete')) {
      variant = "destructive";
    } else if (action.includes('assign') || action.includes('create')) {
      variant = "default";
    } else if (action.includes('change') || action.includes('update')) {
      variant = "secondary";
    }

    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatChangeDetails = (oldValue: any, newValue: any) => {
    if (!oldValue && !newValue) return '-';
    
    try {
      if (typeof oldValue === 'object' || typeof newValue === 'object') {
        return (
          <div className="space-y-1 text-xs">
            {oldValue && (
              <div>
                <span className="font-medium text-red-600">Köhnə:</span>{' '}
                {JSON.stringify(oldValue, null, 2)}
              </div>
            )}
            {newValue && (
              <div>
                <span className="font-medium text-green-600">Yeni:</span>{' '}
                {JSON.stringify(newValue, null, 2)}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div className="space-y-1 text-xs">
          {oldValue && (
            <div>
              <span className="font-medium text-red-600">Köhnə:</span> {oldValue}
            </div>
          )}
          {newValue && (
            <div>
              <span className="font-medium text-green-600">Yeni:</span> {newValue}
            </div>
          )}
        </div>
      );
    } catch {
      return `${oldValue || ''} → ${newValue || ''}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          {t('loading') || 'Yüklənir...'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('roleAuditLog') || 'Rol Audit Jurnal'}
          </span>
          <Button 
            onClick={fetchAuditLogs}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('refresh') || 'Yenilə'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">{t('search') || 'Axtarış'}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('searchAuditLogs') || 'Audit jurnalında axtarın...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="action-filter">{t('action') || 'Əməliyyat'}</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allActions') || 'Bütün əməliyyatlar'}</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-range">{t('dateRange') || 'Tarix aralığı'}</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date') || 'Tarix'}</TableHead>
                <TableHead>{t('user') || 'İstifadəçi'}</TableHead>
                <TableHead>{t('action') || 'Əməliyyat'}</TableHead>
                <TableHead>{t('entityType') || 'Entity Tipi'}</TableHead>
                <TableHead>{t('changes') || 'Dəyişikliklər'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {t('noAuditLogsFound') || 'Audit jurnal qeydləri tapılmadı'}
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{log.user_name || 'Bilinməyən'}</div>
                          <div className="text-xs text-muted-foreground">{log.user_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entity_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {formatChangeDetails(log.old_value, log.new_value)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('totalLogs') || 'Ümumi qeyd sayı'}: {auditLogs.length}
          </span>
          <span>
            {t('lastUpdated') || 'Son yenilənmə'}: {format(new Date(), 'HH:mm')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};