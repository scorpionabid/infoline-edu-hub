import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types/auth";

interface BulkOperation {
  id: string;
  emails: string[];
  role: UserRole;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

export const BulkRoleOperations = () => {
  const { t } = useTranslation();
  const [bulkEmails, setBulkEmails] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("schooladmin");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'superadmin', label: 'SuperAdmin' },
    { value: 'regionadmin', label: 'Region Admin' },
    { value: 'sectoradmin', label: 'Sektor Admin' },
    { value: 'schooladmin', label: 'Məktəb Admin' },
    { value: 'teacher', label: 'Müəllim' },
    { value: 'user', label: 'İstifadəçi' }
  ];

  const handleBulkRoleAssignment = async () => {
    if (!bulkEmails.trim() || !selectedRole) {
      toast.error(t('pleaseEnterEmailsAndRole') || 'Zəhmət olmasa email və rol daxil edin');
      return;
    }

    setIsProcessing(true);
    
    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      toast.error(t('noValidEmails') || 'Keçərli email tapılmadı');
      setIsProcessing(false);
      return;
    }

    const operationId = Date.now().toString();
    const newOperation: BulkOperation = {
      id: operationId,
      emails,
      role: selectedRole,
      status: 'processing'
    };

    setOperations(prev => [newOperation, ...prev]);

    try {
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const email of emails) {
        try {
          // Find user by email
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (profileError || !profiles) {
            errors.push(`${email}: İstifadəçi tapılmadı`);
            failedCount++;
            continue;
          }

          // Update user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: selectedRole })
            .eq('user_id', profiles.id);

          if (roleError) {
            errors.push(`${email}: Rol yenilənə bilmədi - ${roleError.message}`);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push(`${email}: Xəta baş verdi`);
          failedCount++;
        }
      }

      // Update operation results
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              status: 'completed' as const,
              results: {
                success: successCount,
                failed: failedCount,
                errors
              }
            }
          : op
      ));

      toast.success(
        `${successCount} istifadəçinin rolu uğurla yeniləndi. ${failedCount} xəta baş verdi.`
      );

    } catch (error) {
      console.error('Bulk operation error:', error);
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'failed' as const }
          : op
      ));
      toast.error(t('bulkOperationFailed') || 'Toplu əməliyyat uğursuz oldu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      
      // Read CSV file and extract emails
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const emails = lines
          .map(line => line.split(',')[0]?.trim()) // Assume email is first column
          .filter(email => email && email.includes('@'))
          .join('\n');
        setBulkEmails(emails);
      };
      reader.readAsText(file);
    }
  };

  const exportTemplate = () => {
    const csvContent = `email,role,region_id,sector_id,school_id\nexample@email.com,schooladmin,,,\nexample2@email.com,sectoradmin,,sector-id,\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_role_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportOperationResults = (operation: BulkOperation) => {
    if (!operation.results) return;
    
    const csvContent = [
      'email,status,error',
      ...operation.emails.map(email => {
        const error = operation.results?.errors.find(e => e.startsWith(email));
        const status = error ? 'failed' : 'success';
        return `${email},${status},"${error || ''}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_operation_results_${operation.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearOperation = (operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">{t('manualEntry') || 'Manual Giriş'}</TabsTrigger>
          <TabsTrigger value="csv">{t('csvImport') || 'CSV İdxal'}</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('bulkRoleAssignment') || 'Toplu Rol Təyini'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role-select">{t('selectRole') || 'Rol seçin'}</Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-emails">{t('emailAddresses') || 'Email ünvanları'}</Label>
                <Textarea
                  id="bulk-emails"
                  placeholder={t('enterEmailsOnNewLines') || 'Hər sətirdə bir email ünvanı daxil edin...'}
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  rows={8}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {bulkEmails.split('\n').filter(email => email.trim() && email.includes('@')).length} keçərli email
                </p>
              </div>

              <Button 
                onClick={handleBulkRoleAssignment}
                disabled={isProcessing || !bulkEmails.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('processing') || 'İşlənir...'}
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    {t('assignRoles') || 'Rolları Təyin Et'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('csvImport') || 'CSV İdxal'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('csvFormatInfo') || 'CSV faylında email, rol, region_id, sector_id, school_id sütunları olmalıdır.'}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={exportTemplate} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  {t('downloadTemplate') || 'Şablon Yüklə'}
                </Button>
              </div>

              <div>
                <Label htmlFor="csv-file">{t('selectCsvFile') || 'CSV faylı seçin'}</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                />
              </div>

              {csvFile && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {csvFile.name} yükləndi. {bulkEmails.split('\n').filter(email => email.trim()).length} email tapıldı.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operations History */}
      {operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('operationHistory') || 'Əməliyyat Tarixçəsi'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {operations.map((operation) => (
              <div key={operation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      operation.status === 'completed' ? 'default' :
                      operation.status === 'failed' ? 'destructive' :
                      operation.status === 'processing' ? 'secondary' : 'outline'
                    }>
                      {operation.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                      {operation.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {operation.emails.length} istifadəçi → {roles.find(r => r.value === operation.role)?.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {operation.results && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportOperationResults(operation)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('export') || 'İxrac'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearOperation(operation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {operation.results && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{t('successful') || 'Uğurlu'}: {operation.results.success}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>{t('failed') || 'Uğursuz'}: {operation.results.failed}</span>
                    </div>
                  </div>
                )}

                {operation.results?.errors && operation.results.errors.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">
                      {t('viewErrors') || 'Xətaları gör'} ({operation.results.errors.length})
                    </summary>
                    <div className="mt-2 p-2 bg-muted rounded text-xs space-y-1">
                      {operation.results.errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};