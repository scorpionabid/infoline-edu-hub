
import { ReactNode } from "react"
import { toast as sonnerToast, type Toast } from "sonner"

type ToastProps = Toast & {
  title?: ReactNode
  description?: ReactNode
  variant?: "default" | "destructive" | "success" | "warning"
}

const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, variant, ...rest } = props

    return sonnerToast(title as string, {
      description,
      ...rest,
    })
  }

  toast.success = (message: ReactNode, options?: Partial<ToastProps>) => {
    return sonnerToast.success(message as string, options)
  }

  toast.error = (message: ReactNode, options?: Partial<ToastProps>) => {
    return sonnerToast.error(message as string, options)
  }

  toast.warning = (message: ReactNode, options?: Partial<ToastProps>) => {
    return sonnerToast.warning(message as string, options)
  }

  toast.info = (message: ReactNode, options?: Partial<ToastProps>) => {
    return sonnerToast.info(message as string, options)
  }

  toast.loading = (message: ReactNode, options?: Partial<ToastProps>) => {
    return sonnerToast.loading(message as string, options)
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [] as any[], // This is a dummy value, sonner manages toasts internally
    push: toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
  }
}

export { useToast }
