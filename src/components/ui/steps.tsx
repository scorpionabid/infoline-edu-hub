
import * as React from "react"
import { cn } from "@/lib/utils"

const Steps = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  />
))
Steps.displayName = "Steps"

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isActive?: boolean
    isCompleted?: boolean
  }
>(({ className, isActive = false, isCompleted = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
      {
        "border-primary bg-primary text-primary-foreground": isActive,
        "border-primary bg-background text-primary": isCompleted,
        "border-muted-foreground text-muted-foreground": !isActive && !isCompleted,
      },
      // className
    )}
    {...props}
  />
))
Step.displayName = "Step"

export { Steps, Step }
