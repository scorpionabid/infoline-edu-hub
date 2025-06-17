
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Approval {
  id: string;
  schoolName: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected';
  // Add other relevant fields
}

interface ApprovalManagerProps {
  pendingApprovals?: Approval[];
  approvedItems?: Approval[];
  rejectedItems?: Approval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView?: (id: string) => void;
  isLoading?: boolean;
}

export const ApprovalManager: React.FC<ApprovalManagerProps> = ({
  pendingApprovals = [],
  approvedItems = [],
  rejectedItems = [],
  onApprove,
  onReject,
  onView,
  isLoading = false
}) => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    // Calculate initial counts
    setApprovedCount(approvedItems.length);
    setRejectedCount(rejectedItems.length);
  }, [approvedItems, rejectedItems]);

  const handleApprove = (id: string) => {
    onApprove(id);
    // Optimistically update the UI
    setApprovedCount((prev) => prev + 1);
  };

  const handleReject = (id: string) => {
    onReject(id);
    // Optimistically update the UI
    setRejectedCount((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Təsdiq Meneceri
          </h2>
          <p className="text-muted-foreground">
            Gözləyən təsdiqləri idarə edin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Təsdiqlənmiş: {approvedCount}
          </Badge>
          <Badge variant="destructive">
            Rədd edilmiş: {rejectedCount}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingApprovals.map((approval) => (
          <Card key={approval.id} className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{approval.schoolName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Kateqoriya: {approval.categoryName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Gözləyir
                  </Badge>
                  {onView && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => onView(approval.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ətraflı bax</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(approval.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Təsdiq et</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                Məktəb: {approval.schoolName}
              </p>
              <p>
                Kateqoriya: {approval.categoryName}
              </p>
              <div className="flex gap-2 mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => handleApprove(approval.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Təsdiq et
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bu məlumatları təsdiq et</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReject(approval.id)}
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rədd et
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bu məlumatları rədd et</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovalManager;
