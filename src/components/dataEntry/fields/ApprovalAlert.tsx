import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface ApprovalAlertProps {
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date | string;
}

const ApprovalAlert: React.FC<ApprovalAlertProps> = ({
  isApproved,
  approvedBy,
  approvedAt,
}) => {
  const { t } = useTranslation();

  if (!isApproved) return null;

  return (
    <Alert className="mb-4 bg-green-50 border-green-100 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{t("categoryApproved")}</AlertTitle>
      <AlertDescription>
        <p>{t("categoryApprovedDesc")}</p>
        {approvedBy && (
          <div className="mt-2 text-sm">
            <span className="font-medium">{t("approvedBy")}:</span> {approvedBy}
          </div>
        )}
        {approvedAt && (
          <div className="text-sm">
            <span className="font-medium">{t("approvedAt")}:</span>{" "}
            {approvedAt instanceof Date
              ? approvedAt.toLocaleString()
              : new Date(approvedAt).toLocaleString()}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApprovalAlert;
