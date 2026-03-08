import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FlowEnginePage = lazy(() => import("./pages/FlowEnginePage"));
const TeamSettings = lazy(() => import("./pages/flow/TeamSettings"));
const AccountSettingsPage = lazy(() => import("./pages/flow/AccountSettings"));
const DocumentationPage = lazy(() => import("./pages/flow/Documentation"));
const GiveFeedbackPage = lazy(() => import("./pages/flow/GiveFeedback"));
const About = lazy(() => import("./pages/About"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const PlanningSystem = lazy(() => import("./pages/PlanningSystem"));
const Multiagentpage = lazy(() => import("./pages/Multiagentpage"));
const Community = lazy(() => import("./pages/Community"));
const LandingPageLibrary = lazy(() => import("./pages/LandingPageLibrary"));
const Premium = lazy(() => import("./pages/Premium"));
const SettingsBilling = lazy(() => import("./pages/SettingsBilling"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Header = lazy(() => import("./components/Header"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));

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

const HIDDEN_HEADER_PREFIXES = ["/flow", "/image-generator", "/planningsystem", "/multiagentpage"];

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
      <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
      <Route path="/flow" element={<ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary>} />
      <Route path="/flow/prompt-generator" element={<ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary>} />
      <Route path="/flow/color-codes" element={<ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary>} />
      <Route path="/flow-engine" element={<ErrorBoundary><FlowEnginePage /></ErrorBoundary>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/premium" element={<Layout><Premium /></Layout>} />
      <Route path="/community" element={<Layout><Community /></Layout>} />
      <Route path="/image-generator" element={<ImageGenerator />} />
      <Route path="/planningsystem" element={<PlanningSystem />} />
      <Route path="/multiagentpage" element={<Multiagentpage />} />
      <Route path="/landing-pages" element={<LandingPageLibrary />} />
      <Route path="/settings/billing" element={<SettingsBilling />} />
      <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <PersistentHeader />
              <ScrollToTop />
              <Suspense fallback={null}><AppRoutes /></Suspense>
              <Suspense fallback={null}><CookieBanner /></Suspense>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
