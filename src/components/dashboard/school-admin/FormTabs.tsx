
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem } from '@/types/dashboard';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface FormTabsProps {
  upcomingForms: FormItem[];
  recentForms: FormItem[];
  onFormClick?: (formId: string) => void;
}

export function FormTabs({ upcomingForms, recentForms, onFormClick }: FormTabsProps) {
  const [activeTab, setActiveTab] = useState('upcoming');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Təsdiqlənib</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rədd edilib</Badge>;
      case 'pending':
      case 'submitted':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Gözləmədə</Badge>;
      case 'draft':
        return <Badge variant="secondary">Qaralama</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderFormCard = (form: FormItem) => (
    <Card key={form.id} className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{form.categoryName || "Form"}</CardTitle>
          {getStatusBadge(form.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {form.dueDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Son tarix: {format(new Date(form.dueDate), 'dd.MM.yyyy')}</span>
            </div>
          )}
          {form.createdAt && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>Yaradılıb: {format(new Date(form.createdAt), 'dd.MM.yyyy')}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              {form.status === 'approved' ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              ) : form.status === 'rejected' ? (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              )}
              <span className="text-xs font-medium">
                {form.completionRate}% tamamlanıb
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onFormClick && onFormClick(form.id)}
            >
              Ətraflı
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming" className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Qarşıdan gələnlər
        </TabsTrigger>
        <TabsTrigger value="recent" className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Son formlar
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="space-y-4">
        {upcomingForms && upcomingForms.length > 0 ? (
          <div>{upcomingForms.map(renderFormCard)}</div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-2 opacity-20" />
            <p>Qarşıdan gələn form tapılmadı</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="recent" className="space-y-4">
        {recentForms && recentForms.length > 0 ? (
          <div>{recentForms.map(renderFormCard)}</div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-16 w-16 mx-auto mb-2 opacity-20" />
            <p>Son formlar tapılmadı</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
