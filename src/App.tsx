import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InvoicePreview from "./pages/InvoicePreview";
import ProfileSelection from "./pages/ProfileSelection";
import ProfileManagement from "./pages/ProfileManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const basename = basePath === "" ? undefined : basePath;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Ensure routes resolve correctly when the app is served from a sub-path such as GitHub Pages */}
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/profiles" element={<ProfileSelection />} />
            <Route path="/profile/new" element={<ProfileManagement />} />
            <Route path="/" element={<Index />} />
            <Route path="/preview" element={<InvoicePreview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
