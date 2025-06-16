import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { Region } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AssignAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  onSubmit: (userId: string) => Promise<void>;
  isSubmitting: boolean;
}

const AssignAdminDialog: React.FC<AssignAdminDialogProps> = ({
  isOpen,
  onClose,
  region,
  onSubmit,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .order("full_name");

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast.error(t("errorFetchingUsers"), {
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
      setSelectedUserId(region.admin_id || "");
    }
  }, [isOpen, region.admin_id, t]);

  const handleSubmit = async () => {
    if (!selectedUserId || selectedUserId === "NONE") {
      toast.error(t("selectUser"));
      return;
    }

    await onSubmit(selectedUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("assignRegionAdmin")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("region")}
            </label>
            <div className="p-2 border rounded bg-muted/50">{region.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("selectUser")}
            </label>
            <Select
              value={selectedUserId || "NONE"}
              onValueChange={(value) =>
                setSelectedUserId(value === "NONE" ? "" : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectAdmin")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t("noAdminSelected")}</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isLoading ||
                !selectedUserId ||
                selectedUserId === "NONE"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("assign")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAdminDialog;
