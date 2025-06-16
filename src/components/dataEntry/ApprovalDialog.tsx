import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/contexts/TranslationContext";
import { toast } from "sonner";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  categoryName: string;
  isApproving: boolean;
  isRejecting: boolean;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  onApprove,
  onReject,
  categoryName,
  isApproving,
  isRejecting,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    onApprove();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error(t("rejectionReasonRequired"));
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "approve"
              ? t("confirmApproval")
              : t("confirmRejection")}
          </DialogTitle>
          <DialogDescription>
            {activeTab === "approve"
              ? t("approveDescription").replace("{category}", categoryName)
              : t("rejectDescription").replace("{category}", categoryName)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-4">
          <Button
            variant={activeTab === "approve" ? "default" : "ghost"}
            className="w-full flex-1"
            onClick={() => setActiveTab("approve")}
          >
            {t("approve")}
          </Button>
          <Button
            variant={activeTab === "reject" ? "default" : "ghost"}
            className="w-full flex-1"
            onClick={() => setActiveTab("reject")}
          >
            {t("reject")}
          </Button>
        </div>

        {activeTab === "reject" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("rejectionReason")} <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder={t("enterRejectionReason")}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>

          {activeTab === "approve" ? (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? t("processing") : t("approve")}
            </Button>
          ) : (
            <Button
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
              variant="destructive"
            >
              {isRejecting ? t("processing") : t("reject")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
