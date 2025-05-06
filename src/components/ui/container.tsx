
import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container komponenti - məzmunu məhdud genişlikdə saxlamaq və mərkəzləşdirmək üçün
 */
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn("container mx-auto px-4 md:px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
