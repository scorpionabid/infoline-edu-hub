
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { AppRoutes } from "@/routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore(selectUser);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TranslationProvider>
          <NotificationProvider userId={user?.id}>
            <TooltipProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <AppRoutes />
              </div>
              <Toaster position="top-right" />
            </TooltipProvider>
          </NotificationProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
