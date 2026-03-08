import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthDialogProvider } from "./contexts/AuthDialogContext";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import CookieBanner from "./components/CookieBanner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const FlowEnginePage = lazy(() => import("./pages/FlowEnginePage"));
const Auth = lazy(() => import("./pages/Auth"));

const About = lazy(() => import("./pages/About"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const PlanningSystem = lazy(() => import("./pages/PlanningSystem"));
const Multiagentpage = lazy(() => import("./pages/Multiagentpage"));
const Community = lazy(() => import("./pages/Community"));
const LandingPageLibrary = lazy(() => import("./pages/LandingPageLibrary"));
const Premium = lazy(() => import("./pages/Premium"));
const SettingsBilling = lazy(() => import("./pages/SettingsBilling"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

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

const HIDDEN_HEADER_PREFIXES = ["/flow", "/image-generator", "/planningsystem", "/multiagentpage", "/auth"];

const RedirectLoggedInToFlow = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/flow", { replace: true });
    }
  }, [user, navigate]);
  if (user) return null;
  return <>{children}</>;
};

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
        <RedirectLoggedInToFlow>
          <ErrorBoundary>
            <Index />
          </ErrorBoundary>
        </RedirectLoggedInToFlow>
      } />
      {/* Flow routes - path selection with sub-routes */}
      <Route path="/flow" element={<ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary>} />
      <Route path="/flow/prompt-generator" element={<ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary>} />
      <Route path="/flow/color-codes" element={<ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary>} />
      {/* Legacy route - redirect to new /flow */}
      <Route path="/flow-engine" element={<ErrorBoundary><FlowEnginePage /></ErrorBoundary>} />
      <Route path="/about" element={
        <RedirectLoggedInToFlow>
          <Layout><About /></Layout>
        </RedirectLoggedInToFlow>
      } />
      <Route path="/premium" element={
        <RedirectLoggedInToFlow>
          <Layout><Premium /></Layout>
        </RedirectLoggedInToFlow>
      } />
      <Route path="/community" element={
        <RedirectLoggedInToFlow>
          <Layout><Community /></Layout>
        </RedirectLoggedInToFlow>
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
                <Suspense fallback={null}><AppRoutes /></Suspense>
                <CookieBanner />
              </AuthDialogProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
