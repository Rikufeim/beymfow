import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthDialogProvider } from "./contexts/AuthDialogContext";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import FlowEnginePage from "./pages/FlowEnginePage";
import ImageGenerator from "./pages/ImageGenerator";
import PlanningSystem from "./pages/PlanningSystem";
import Multiagentpage from "./pages/Multiagentpage";
import Community from "./pages/Community";
import LandingPageLibrary from "./pages/LandingPageLibrary";
import Premium from "./pages/Premium";
import SettingsBilling from "./pages/SettingsBilling";
import PaymentSuccess from "./pages/PaymentSuccess";
import Auth from "./pages/Auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const HIDDEN_HEADER_PREFIXES = ["/flow/prompt-generator", "/flow/color-codes", "/image-generator", "/planningsystem", "/multiagentpage", "/landing-pages", "/auth"];

const PersistentHeader = () => {
  const { pathname } = useLocation();
  const hidden = HIDDEN_HEADER_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (hidden) return null;
  return <Header />;
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [location.pathname]);

  return null;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ErrorBoundary>
          <Index />
        </ErrorBoundary>
      } />
      {/* Flow routes - path selection with sub-routes */}
      <Route path="/flow" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/prompt-generator" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/color-codes" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary></ProtectedRoute>} />
      {/* Legacy route - redirect to new /flow */}
      <Route path="/flow-engine" element={<ErrorBoundary><FlowEnginePage /></ErrorBoundary>} />
      <Route path="/about" element={
        <Layout>
          <About />
        </Layout>
      } />
      <Route path="/premium" element={
        <Layout>
          <Premium />
        </Layout>
      } />
      <Route path="/community" element={
        <Layout>
          <Community />
        </Layout>
      } />
      <Route path="/image-generator" element={<ImageGenerator />} />
      <Route path="/planningsystem" element={<PlanningSystem />} />
      <Route path="/multiagentpage" element={<Multiagentpage />} />
      <Route path="/landing-pages" element={<LandingPageLibrary />} />
      <Route path="/settings/billing" element={<SettingsBilling />} />
      <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={
        <Layout>
          <NotFound />
        </Layout>
      } />
    </Routes>
  );
};

const CRITICAL_IMAGES: string[] = [
  "/lovable-uploads/45481b23-2d43-4186-a282-479adb37456b.png",
  "/lovable-uploads/65f7d709-a319-4bd3-ae8b-fb7acfb196db.png",
];

const GlobalImagePreloader = () => {
  useImagePreloader({ images: CRITICAL_IMAGES });
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <AuthDialogProvider>
                <GlobalImagePreloader />
                <PersistentHeader />
                <ScrollToTop />
                <AppRoutes />
              </AuthDialogProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
