import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { useApprovalData } from "@/hooks/approval/useApprovalData";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import ApprovalManager from "@/components/approval/ApprovalManager";

const ApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    pendingApprovals,
    approvedItems,
    rejectedItems,
    isLoading,
    approveItem,
    rejectItem,
    viewItem,
  } = useApprovalData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-2">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("dataApproval")}</h1>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("pendingApprovals")}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingApprovals.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("approvedItems")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvedItems.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("rejectedItems")}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {rejectedItems.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval manager */}
        <ApprovalManager
          pendingApprovals={pendingApprovals}
          approvedItems={approvedItems}
          rejectedItems={rejectedItems}
          onApprove={approveItem}
          onReject={rejectItem}
          onView={viewItem}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ApprovalPage;
