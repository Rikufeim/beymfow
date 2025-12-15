import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Features from "./pages/Features";
import Premium from "./pages/Premium";
import PromptLabPage from "./pages/PromptLabPage";
import FlowEnginePage from "./pages/FlowEnginePage";

import BusinessPrompts from "./pages/BusinessPrompts";
import PromptLab from "./pages/PromptLab";
import PromptLibrary from "./pages/PromptLibrary";
import ImageGenerator from "./pages/ImageGenerator";
import ImageToPrompt from "./pages/ImageToPrompt";
import PlanningSystem from "./pages/PlanningSystem";
import AIGenerator from "./pages/promptlab/AIGenerator";
import PromptChecking from "./pages/promptlab/PromptChecking";
import ImagePrompts from "./pages/promptlab/ImagePrompts";
import VideoPrompts from "./pages/promptlab/VideoPrompts";
import TextDetector from "./pages/promptlab/TextDetector";
import Humanizer from "./pages/promptlab/Humanizer";
import PromptLibraryPage from "./pages/promptlab/PromptLibraryPage";
import { useImagePreloader } from "./hooks/useImagePreloader";
import Multiagentpage from "./pages/Multiagentpage";

const queryClient = new QueryClient();

// ScrollToTop component that handles scroll behavior
const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Always scroll to top when navigating to a new page
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return null;
};

// AnimatedRoutes component with page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<Features />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/flow-engine" element={<ProtectedRoute><FlowEnginePage /></ProtectedRoute>} />
        <Route path="/prompt-lab-page" element={<ProtectedRoute><PromptLabPage /></ProtectedRoute>} />
        <Route path="/prompt-lab-page/library" element={<PromptLibraryPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/about" element={
          <Layout>
            <About />
          </Layout>
        } />
        <Route path="/business-prompts" element={<BusinessPrompts />} />
        <Route path="/prompt-lab" element={<PromptLab />} />
        <Route path="/prompt-library" element={<PromptLibrary />} />
        <Route path="/image-generator" element={<ImageGenerator />} />
        <Route path="/image-to-prompt" element={<ImageToPrompt />} />
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
  );
};

// Global image preloader for critical images
const GlobalImagePreloader = () => {
  // Preload all critical images globally for instant access
  const criticalImages = [
    // Homepage critical images
    "/lovable-uploads/45481b23-2d43-4186-a282-479adb37456b.png", // CRYPTO GUIDES
    "/lovable-uploads/65f7d709-a319-4bd3-ae8b-fb7acfb196db.png", // PROMPTS
  ];
  
  useImagePreloader({ images: criticalImages });
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
