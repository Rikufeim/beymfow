import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout";
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

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [location.pathname]);

  return null;
};

const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen w-full">
      <AnimatePresence mode="sync">
        <motion.div
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full overflow-y-auto"
        >
        <Routes location={location}>
      <Route path="/" element={
        <ErrorBoundary>
          <Index />
        </ErrorBoundary>
      } />
      {/* Flow routes - path selection with sub-routes */}
      <Route path="/flow" element={<ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary>} />
      <Route path="/flow/prompt-generator" element={<ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary>} />
      <Route path="/flow/color-codes" element={<ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary>} />
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
      <Route path="*" element={
        <Layout>
          <NotFound />
        </Layout>
      } />
        </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
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
