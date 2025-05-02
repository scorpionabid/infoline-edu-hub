
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingApprovalItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsCardProps {
  items: PendingApprovalItem[];
}

export const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ items }) => {
  const navigate = useNavigate();
  
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Təsdiq gözləyənlər</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Təsdiq gözləyən məlumat yoxdur
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Təsdiq gözləyənlər</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
              <div>
                <h4 className="font-medium">{item.categoryName}</h4>
                <div className="text-sm text-muted-foreground">{item.schoolName}</div>
                <div className="flex items-center text-xs mt-1 text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.submittedAt}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4"
                onClick={() => navigate(`/approvals?id=${item.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                İncələ
              </Button>
            </div>
          ))}
          
          {items.length > 5 && (
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => navigate('/approvals')}
            >
              {items.length - 5} daha görüntülə
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
