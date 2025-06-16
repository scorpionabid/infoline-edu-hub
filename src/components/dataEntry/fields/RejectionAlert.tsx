import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface RejectionAlertProps {
  errorMessage: string;
  rejectedBy?: string;
  rejectedAt?: Date | string;
}

const RejectionAlert: React.FC<RejectionAlertProps> = ({
  errorMessage,
  rejectedBy,
  rejectedAt,
}) => {
  const { t } = useTranslation();

  if (!errorMessage) return null;

  return (
    <Alert className="mb-4 bg-red-50 border-red-100 text-red-800">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{t("categoryRejected")}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{t("fixErrorsAndResubmit")}</p>
        <div className="mt-2 p-2 bg-red-100 rounded text-sm">
          <strong>{t("rejectionReason")}:</strong> {errorMessage}
        </div>
        {rejectedBy && (
          <div className="text-sm">
            <span className="font-medium">{t("rejectedBy")}:</span> {rejectedBy}
          </div>
        )}
        {rejectedAt && (
          <div className="text-sm">
            <span className="font-medium">{t("rejectedAt")}:</span>{" "}
            {rejectedAt instanceof Date
              ? rejectedAt.toLocaleString()
              : new Date(rejectedAt).toLocaleString()}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default RejectionAlert;
