
// Import and export toast functions from the hooks folder
import { toast } from 'sonner';
import { useToast as useToastHook } from "@/hooks/use-toast";

export { useToastHook as useToast, toast };
