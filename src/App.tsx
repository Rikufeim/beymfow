import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthDialogProvider } from "./contexts/AuthDialogContext";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";

// Lazy load non-critical pages
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));

const FlowEnginePage = lazy(() => import("./pages/FlowEnginePage"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const PlanningSystem = lazy(() => import("./pages/PlanningSystem"));
const Multiagentpage = lazy(() => import("./pages/Multiagentpage"));
const Community = lazy(() => import("./pages/Community"));
const LandingPageLibrary = lazy(() => import("./pages/LandingPageLibrary"));
const Premium = lazy(() => import("./pages/Premium"));


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

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={
          <ErrorBoundary>
            <Index />
          </ErrorBoundary>
        } />
        {/* Flow routes - path selection with sub-routes */}
        <Route path="/flow" element={<ErrorBoundary><FlowEnginePage /></ErrorBoundary>} />
        <Route path="/flow/prompt-generator" element={<ErrorBoundary><FlowEnginePage initialWorkspace="prompt-generator" /></ErrorBoundary>} />
        <Route path="/flow/color-codes" element={<ErrorBoundary><FlowEnginePage initialWorkspace="color-codes" /></ErrorBoundary>} />
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
        <Route path="*" element={
          <Layout>
            <NotFound />
          </Layout>
        } />
      </Routes>
    </Suspense>
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
                <AnimatedRoutes />
              </AuthDialogProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
