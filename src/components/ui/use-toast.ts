
// Import and export toast functions from the hooks folder
import { toast } from 'sonner';
import { useToast as useToastHook } from "@/hooks/common/useToast";

export { useToastHook as useToast, toast };
