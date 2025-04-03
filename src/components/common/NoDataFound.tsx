
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

interface NoDataFoundProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <FileQuestion className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default NoDataFound;
