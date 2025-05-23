
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
// Sonner toast kitabxanası özü toasts-ları idarə edir, useToast-a ehtiyac yoxdur
import { toast } from "sonner"

export function Toaster() {
  // Soner toast sistemindən gələn toasts array yoxdur
  // Buna görə bu komponent boş bir provider təqdim edir
  // Və soner öz UI-nı göstərəcək
  return (
    <ToastProvider>
      {/* Soner toast sistemində xatırlanan toasts-ları məhz Soner özü idarə edir */}
      <ToastViewport />
    </ToastProvider>
  )
}
