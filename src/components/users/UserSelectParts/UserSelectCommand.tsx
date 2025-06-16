import React from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { SafeCommand } from "./SafeCommand";
import { useTranslation } from "@/contexts/TranslationContext";
import { User } from "./types";
import { UserErrorState } from "./UserErrorState";
import { UserEmptyState } from "./UserEmptyState";

interface UserSelectCommandProps {
  users: User[];
  loading: boolean;
  error: string | null;
  value: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string) => void;
  onRetry?: () => void;
}

export const UserSelectCommand: React.FC<UserSelectCommandProps> = ({
  users,
  loading,
  error,
  value,
  searchTerm,
  onSearchChange,
  onSelect,
  onRetry,
}) => {
  const { t } = useTranslation();

  // Təhlükəsiz istifadə üçün users massivini əlavə yoxlama
  // undefined və null elementləri filtrləyirik və əmin oluruq ki, hər bir istifadəçinin id-si var
  const safeUsers = Array.isArray(users)
    ? users.filter((user) => user && typeof user === "object" && user.id)
    : [];

  // Xəta halında göstəriləcək fallback UI
  const fallbackUI = (
    <div className="p-4">
      <button
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={onRetry}
      >
        Yenidən cəhd et
      </button>
    </div>
  );

  return (
    <SafeCommand fallback={fallbackUI}>
      <CommandInput
        placeholder={t("searchUser") || "İstifadəçi axtar..."}
        value={searchTerm}
        onValueChange={onSearchChange}
      />

      {error ? (
        <UserErrorState error={error} onRetry={onRetry} />
      ) : loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <CommandEmpty>
            {t("noUsersFound") || "İstifadəçi tapılmadı"}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {safeUsers && safeUsers.length > 0 ? (
              safeUsers.map((user) =>
                user && user.id ? (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => onSelect(user.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.full_name || "İsimsiz İstifadəçi"}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email || ""}
                      </span>
                    </div>
                  </CommandItem>
                ) : null,
              )
            ) : (
              <UserEmptyState />
            )}
          </CommandGroup>
        </>
      )}
    </SafeCommand>
  );
};
