
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const stepVariants = cva(
  "flex items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-muted bg-muted text-muted-foreground",
        active: "border-primary bg-primary text-primary-foreground",
        completed: "border-primary bg-primary text-primary-foreground",
      },
      size: {
        default: "h-8 w-8",
        sm: "h-6 w-6 text-xs",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  steps: Array<{
    title: string
    description?: string
  }>
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ className, currentStep, steps, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isActive = stepNumber === currentStep
            
            return (
              <div key={index} className="flex items-center">
                <div
                  className={cn(
                    stepVariants({
                      variant: isCompleted ? "completed" : isActive ? "active" : "default",
                    })
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 mx-2",
                      isCompleted || stepNumber < currentStep
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium">
            {steps[currentStep - 1]?.title}
          </h3>
          {steps[currentStep - 1]?.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {steps[currentStep - 1].description}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Steps.displayName = "Steps"

export { Steps, stepVariants }
