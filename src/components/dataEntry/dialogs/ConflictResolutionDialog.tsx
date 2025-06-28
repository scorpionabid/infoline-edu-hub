import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  User,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { format } from "date-fns";

interface ConflictData {
  columnId: string;
  columnName?: string;
  localValue: any;
  serverValue: any;
  lastModified: string;
  modifiedBy: string;
  modifiedByName?: string;
}

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictData[];
  localChanges: Record<string, any>;
  serverChanges: Record<string, any>;
  onResolve: (
    resolution: "local" | "server" | "merge" | "field-by-field",
    fieldResolutions?: Record<string, "local" | "server">,
  ) => void;
  onCancel?: () => void;
  userInfo?: {
    currentUser: string;
    conflictUser: string;
  };
}

type ResolutionStrategy = "local" | "server" | "merge" | "field-by-field";

export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  open,
  onOpenChange,
  conflicts,
  localChanges,
  serverChanges,
  onResolve,
  onCancel,
  userInfo,
}) => {
  const { t } = useTranslation();
  const [selectedStrategy, setSelectedStrategy] =
    useState<ResolutionStrategy>("merge");
  const [fieldResolutions, setFieldResolutions] = useState<
    Record<string, "local" | "server">
  >({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize field resolutions with merge strategy (prefer newer values)
  React.useEffect(() => {
    if (conflicts.length > 0) {
      const initialResolutions: Record<string, "local" | "server"> = {};
      conflicts.forEach((conflict) => {
        // Default to server value for field-by-field resolution
        initialResolutions[conflict.columnId] = "server";
      });
      setFieldResolutions(initialResolutions);
    }
  }, [conflicts]);

  const handleFieldResolutionChange = useCallback(
    (columnId: string, resolution: "local" | "server") => {
      setFieldResolutions((prev) => ({
        ...prev,
        [columnId]: resolution,
      }));
    },
    [],
  );

  const handleResolve = useCallback(() => {
    if (selectedStrategy === "field-by-field") {
      onResolve(selectedStrategy, fieldResolutions);
    } else {
      onResolve(selectedStrategy);
    }
  }, [selectedStrategy, fieldResolutions, onResolve]);

  const formatValue = useCallback(
    (value: any): string => {
      if (value === null || value === undefined) return t("empty");
      if (typeof value === "boolean") return value ? t("yes") : t("no");
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    },
    [t],
  );

  const getResolutionColor = (strategy: ResolutionStrategy): string => {
    switch (strategy) {
      case "local":
        return "bg-blue-50 border-blue-200";
      case "server":
        return "bg-green-50 border-green-200";
      case "merge":
        return "bg-purple-50 border-purple-200";
      case "field-by-field":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const renderValue = (
    value: any,
    label: string,
    timestamp?: string,
    user?: string,
  ) => (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {label}
          {timestamp && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {format(new Date(timestamp), "HH:mm:ss")}
            </Badge>
          )}
        </CardTitle>
        {user && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            {user}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="p-3 bg-muted rounded-md font-mono text-sm">
          {formatValue(value)}
        </div>
      </CardContent>
    </Card>
  );

  const renderConflictField = (conflict: ConflictData) => (
    <div key={conflict.columnId} className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {conflict.columnName || conflict.columnId}
        </h4>
        {selectedStrategy === "field-by-field" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={
                fieldResolutions[conflict.columnId] === "local"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                handleFieldResolutionChange(conflict.columnId, "local")
              }
            >
              {t("useLocal")}
            </Button>
            <Button
              size="sm"
              variant={
                fieldResolutions[conflict.columnId] === "server"
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                handleFieldResolutionChange(conflict.columnId, "server")
              }
            >
              {t("useServer")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderValue(
          conflict.localValue,
          t("yourChanges"),
          undefined,
          userInfo?.currentUser,
        )}
        <div className="flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        {renderValue(
          conflict.serverValue,
          t("serverChanges"),
          conflict.lastModified,
          conflict.modifiedByName || userInfo?.conflictUser,
        )}
      </div>

      {selectedStrategy === "field-by-field" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {fieldResolutions[conflict.columnId] === "local"
              ? t("yourValueWillBeKept")
              : t("serverValueWillBeUsed")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            {t("dataConflictDetected")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conflict Summary */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("conflictDescription", { count: conflicts.length })}
            </AlertDescription>
          </Alert>

          {/* Resolution Strategy Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">{t("chooseResolutionStrategy")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  strategy: "local" as ResolutionStrategy,
                  title: t("keepYourChanges"),
                  description: t("keepYourChangesDesc"),
                  icon: CheckCircle,
                },
                {
                  strategy: "server" as ResolutionStrategy,
                  title: t("useServerVersion"),
                  description: t("useServerVersionDesc"),
                  icon: RefreshCw,
                },
                {
                  strategy: "merge" as ResolutionStrategy,
                  title: t("smartMerge"),
                  description: t("smartMergeDesc"),
                  icon: RefreshCw,
                },
                {
                  strategy: "field-by-field" as ResolutionStrategy,
                  title: t("fieldByField"),
                  description: t("fieldByFieldDesc"),
                  icon: RefreshCw,
                },
              ].map(({ strategy, title, description, icon: Icon }) => (
                <Card
                  key={strategy}
                  className={`cursor-pointer transition-all ${
                    selectedStrategy === strategy
                      ? `ring-2 ring-primary ${getResolutionColor(strategy)}`
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 text-primary" />
                      <div className="space-y-1">
                        <h4 className="font-medium">{title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? t("hideDetails") : t("showDetails")}
            </Button>
          </div>

          {/* Detailed Conflict View */}
          {showAdvanced && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-medium">{t("conflictDetails")}</h3>
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  {conflicts.map(renderConflictField)}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Resolution Preview */}
          {selectedStrategy !== "field-by-field" && (
            <div className="space-y-3">
              <h3 className="font-medium">{t("resolutionPreview")}</h3>
              <Card className={getResolutionColor(selectedStrategy)}>
                <CardContent className="p-4">
                  <div className="text-sm">
                    {selectedStrategy === "local" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        {t("allLocalChangesWillBeKept")}
                      </div>
                    )}
                    {selectedStrategy === "server" && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        {t("allServerChangesWillBeUsed")}
                      </div>
                    )}
                    {selectedStrategy === "merge" && (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                        {t("automaticMergeWillBeApplied")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleResolve} className="min-w-24">
            {selectedStrategy === "local" && (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("keepMine")}
              </>
            )}
            {selectedStrategy === "server" && (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("useServer")}
              </>
            )}
            {selectedStrategy === "merge" && (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("mergeChanges")}
              </>
            )}
            {selectedStrategy === "field-by-field" && (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("applySelections")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
