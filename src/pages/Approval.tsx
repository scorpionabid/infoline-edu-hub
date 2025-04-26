
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApprovalData } from "@/hooks/useApprovalData";

export const Approval: React.FC = () => {
  const { t } = useLanguage();
  const { data, loading, error } = useApprovalData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading={t("approvalPage")}
        subheading={t("approvalPageDescription")}
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="pending">{t("pendingApprovals")}</TabsTrigger>
          <TabsTrigger value="approved">{t("approvedEntries")}</TabsTrigger>
          <TabsTrigger value="rejected">{t("rejectedEntries")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingApprovals")}</CardTitle>
              <CardDescription>{t("pendingApprovalsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>{t("loading")}</p>
              ) : error ? (
                <p className="text-red-500">{t("errorLoadingData")}</p>
              ) : data && data.length > 0 ? (
                <p>{t("pendingApprovalsCount", { count: data.length })}</p>
              ) : (
                <p>{t("noPendingApprovals")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("approvedEntries")}</CardTitle>
              <CardDescription>{t("approvedEntriesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("noDataAvailable")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("rejectedEntries")}</CardTitle>
              <CardDescription>{t("rejectedEntriesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("noDataAvailable")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Approval;
