
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  FormTabsProps,
  CategoryItem,
  DeadlineItem,
  FormItem,
} from "@/types/dashboard";

const FormTabs: React.FC<FormTabsProps> = ({
  categories,
  upcoming,
  pendingForms,
  navigateToDataEntry,
  handleFormClick,
  onCategoryChange,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-green-500",
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-green-500",
      },
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        className: "bg-yellow-500",
      },
      rejected: {
        variant: "destructive" as const,
        icon: AlertTriangle,
        className: "",
      },
      overdue: {
        variant: "destructive" as const,
        icon: AlertTriangle,
        className: "",
      },
      in_progress: {
        variant: "secondary" as const,
        icon: FileText,
        className: "bg-blue-500",
      },
      not_started: {
        variant: "outline" as const,
        icon: FileText,
        className: "",
      },
    };

    const config = statusConfig[status] || statusConfig["not_started"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {t(status) || status}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="categories">{t("categories") || "Kateqoriyalar"}</TabsTrigger>
        <TabsTrigger value="deadlines">{t("upcomingDeadlines") || "Son Tarixlər"}</TabsTrigger>
        <TabsTrigger value="forms">{t("pendingForms") || "Gözləyən Formalar"}</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {categories?.map((category: CategoryItem) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                  {getStatusBadge(category.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t("progress") || "Tərəqqi"}</span>
                      <span>
                        {category.completionRate || category.completion || 0}%
                      </span>
                    </div>
                    <Progress
                      value={
                        category.completionRate || category.completion || 0
                      }
                      className="h-2"
                    />
                  </div>

                  {category.totalFields && (
                    <div className="text-sm text-muted-foreground">
                      {category.completedFields || 0} / {category.totalFields}{" "}
                      {t("fieldsCompleted") || "sahə tamamlandı"}
                    </div>
                  )}

                  {category.lastUpdated && (
                    <div className="text-xs text-muted-foreground">
                      {t("lastUpdated") || "Son yenilənmə"}:{" "}
                      {new Date(category.lastUpdated).toLocaleDateString()}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      onCategoryChange?.(category.id);
                      navigateToDataEntry();
                    }}
                    className="w-full"
                    variant={
                      category.status === "completed" ? "secondary" : "default"
                    }
                  >
                    {category.status === "completed"
                      ? t("viewData") || "Məlumatı göstər"
                      : t("enterData") || "Məlumat daxil et"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="deadlines" className="space-y-4">
        {upcoming?.map((deadline: DeadlineItem) => (
          <Card key={deadline.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {deadline.title || deadline.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("deadline") || "Son tarix"}:{" "}
                    {new Date(deadline.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {deadline.daysLeft} {t("daysLeft") || "gün qaldı"}
                  </p>
                </div>
                <div className="text-right">
                  {deadline.priority && (
                    <Badge
                      variant="outline"
                      className={getPriorityColor(deadline.priority)}
                    >
                      {t(deadline.priority) || deadline.priority}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      deadline.status === "overdue"
                        ? "destructive"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {t(deadline.status) || deadline.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="forms" className="space-y-4">
        {pendingForms?.map((form: FormItem) => (
          <Card
            key={form.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{form.title || form.name}</h3>
                  {form.category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("category") || "Kateqoriya"}: {form.category}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t("lastModified") || "Son dəyişiklik"}:{" "}
                    {new Date(form.lastModified).toLocaleDateString()}
                  </p>
                  {form.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={form.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {form.progress}% {t("completed") || "tamamlandı"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(form.status)}
                  <Button
                    onClick={() => handleFormClick?.(form.id)}
                    size="sm"
                    className="mt-2"
                  >
                    {t("continue") || "Davam et"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
