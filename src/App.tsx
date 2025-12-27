import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PageTransition } from "./components/PageTransition";

// Lazy load all pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Features = lazy(() => import("./pages/Features"));
const Premium = lazy(() => import("./pages/Premium"));
const PromptLabPage = lazy(() => import("./pages/PromptLabPage"));
const FlowEnginePage = lazy(() => import("./pages/FlowEnginePage"));
const BusinessPrompts = lazy(() => import("./pages/BusinessPrompts"));
const PromptLab = lazy(() => import("./pages/PromptLab"));
const PromptLibrary = lazy(() => import("./pages/PromptLibrary"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const PlanningSystem = lazy(() => import("./pages/PlanningSystem"));
const AIGenerator = lazy(() => import("./pages/promptlab/AIGenerator"));
const PromptChecking = lazy(() => import("./pages/promptlab/PromptChecking"));
const ImagePrompts = lazy(() => import("./pages/promptlab/ImagePrompts"));
const VideoPrompts = lazy(() => import("./pages/promptlab/VideoPrompts"));
const TextDetector = lazy(() => import("./pages/promptlab/TextDetector"));
const Humanizer = lazy(() => import("./pages/promptlab/Humanizer"));
const PromptLibraryPage = lazy(() => import("./pages/promptlab/PromptLibraryPage"));
const Multiagentpage = lazy(() => import("./pages/Multiagentpage"));

const CategoryViewPage = lazy(() => import("./pages/CategoryViewPage"));
const Community = lazy(() => import("./pages/Community"));

// Optimized QueryClient with better defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// ScrollToTop component that handles scroll behavior - optimized for performance
const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Use requestAnimationFrame for smoother, non-blocking scroll
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
  }, [location.pathname]);
  
  return null;
};

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

// AnimatedRoutes component with smooth page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={
              <ErrorBoundary>
                <Index />
              </ErrorBoundary>
            } />
            <Route path="/features" element={<Features />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/flow-engine" element={<ProtectedRoute><FlowEnginePage /></ProtectedRoute>} />
            <Route path="/prompt-lab-page" element={<ProtectedRoute><PromptLabPage /></ProtectedRoute>} />
            <Route path="/prompt-lab-page/library" element={<PromptLibraryPage />} />
            <Route path="/prompt-lab-page/category/:categoryName" element={<ProtectedRoute><CategoryViewPage /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/about" element={
              <Layout>
                <About />
              </Layout>
            } />
            <Route path="/community" element={
              <Layout>
                <Community />
              </Layout>
            } />
            <Route path="/business-prompts" element={<BusinessPrompts />} />
            <Route path="/prompt-lab" element={<PromptLab />} />
            <Route path="/prompt-library" element={<PromptLibrary />} />
            <Route path="/image-generator" element={<ImageGenerator />} />
            <Route path="/planningsystem" element={<PlanningSystem />} />
            <Route path="/prompt-lab/ai-generator" element={<AIGenerator />} />
            <Route path="/prompt-lab/checking" element={<PromptChecking />} />
            <Route path="/prompt-lab/image-prompts" element={<ImagePrompts />} />
            <Route path="/prompt-lab/video-prompts" element={<VideoPrompts />} />
            <Route path="/prompt-lab/text-detector" element={<TextDetector />} />
            <Route path="/prompt-lab/humanizer" element={<Humanizer />} />
            <Route path="/multiagentpage" element={<Multiagentpage />} />
            
            {/* Custom routes above the catch-all */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </PageTransition>
      </Suspense>
    </AnimatePresence>
  );
};

// Global image preloader for critical images
// Memoize images array to prevent unnecessary re-runs
const CRITICAL_IMAGES: string[] = [
  // Homepage critical images
  "/lovable-uploads/45481b23-2d43-4186-a282-479adb37456b.png", // CRYPTO GUIDES
  "/lovable-uploads/65f7d709-a319-4bd3-ae8b-fb7acfb196db.png", // PROMPTS
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
              <GlobalImagePreloader />
              <ScrollToTop />
              <AnimatedRoutes />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
