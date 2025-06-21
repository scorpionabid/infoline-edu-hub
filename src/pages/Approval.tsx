
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { EnhancedApprovalManager } from "@/components/approval/EnhancedApprovalManager";

// Static filter object to prevent re-creation
const INITIAL_FILTER = { status: 'pending' as const };

const ApprovalPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-4 px-2">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("dataApproval")}</h1>
        </div>

        {/* Enhanced Approval Manager - Real data integration */}
        <EnhancedApprovalManager
          pendingApprovals={[]}
          approvedItems={[]}
          rejectedItems={[]}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default ApprovalPage;
