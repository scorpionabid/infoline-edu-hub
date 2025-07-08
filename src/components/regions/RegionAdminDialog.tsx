import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/TranslationContext";
import { useSuperUsers } from "@/hooks/useSuperUsers";
import { toast } from "sonner";
import { useRegionAdmins } from "@/hooks/useRegionAdmins";

export interface RegionAdminDialogProps {
  open: boolean;
  onClose: () => void;
  regionId: string;
  onSuccess?: () => void;
}

const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({
  open,
  onClose,
  regionId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [email, setEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { users, loading: usersLoading } = useSuperUsers();
  const { admins, loading: adminsLoading } = useRegionAdmins();

  // Dialog açıldığında dəyərləri sıfırla
  useEffect(() => {
    if (open) {
      setMode("existing");
      setEmail("");
      setSelectedUser("");
      setSuccess(false);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "existing") {
        if (!selectedUser) {
          throw new Error(t("selectUserRequired"));
        }

        // Mövcud istifadəçini region admini təyin et
        // await assignRegionAdmin(regionId, selectedUser);
        console.log("Mövcud istifadəçi region admini təyin edilir", {
          regionId,
          userId: selectedUser,
        });
      } else {
        if (!email) {
          throw new Error(t("emailRequired"));
        }

        // Yeni istifadəçi yaradıb region admini təyin et
        // await createAndAssignRegionAdmin(regionId, email);
        console.log("Yeni istifadəçi yaradılır və region admini təyin edilir", {
          regionId,
          email,
        });
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      toast.success(t("regionAdminAssigned"));

      // Uğurlu olduqdan sonra dialoqu bağla
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Region admini təyin edilərkən xəta:", err);
      setError(err.message || t("regionAdminAssignmentError"));
      toast.error(t("regionAdminAssignmentError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("assignRegionAdmin")}</DialogTitle>
          <DialogDescription>{t("assignRegionAdminDesc")}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">
              {t("regionAdminAssignedSuccessfully")}
            </h3>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {t("regionAdminAssignedSuccessMessage")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-6">
              <RadioGroup
                defaultValue="existing"
                value={mode}
                onValueChange={(value) => setMode(value as "existing" | "new")}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="existing">{t("existingUser")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("existingUserDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mt-4">
                  <RadioGroupItem value="new" id="new" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="new">{t("newUser")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("newUserDesc")}
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {mode === "existing" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("selectUser")}</Label>
                    {usersLoading || adminsLoading ? (
                      <p className="text-sm text-muted-foreground">
                        {t("loadingUsers")}
                      </p>
                    ) : users.length > 0 ? (
                      <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className={`p-3 cursor-pointer hover:bg-secondary ${selectedUser === user.id ? "bg-secondary" : ""}`}
                            onClick={() => setSelectedUser(user.id)}
                          >
                            <div className="font-medium">
                              {user.full_name || user.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("noUsersFound")}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      placeholder={t("enterEmail")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-800 rounded">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={loading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegionAdminDialog;
export { RegionAdminDialog };
