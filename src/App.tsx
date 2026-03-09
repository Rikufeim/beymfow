import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Layout from "./components/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthDialogProvider } from "./contexts/AuthDialogContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const FlowEnginePage = lazy(() => import("./pages/FlowEnginePage"));
const TeamSettings = lazy(() => import("./pages/flow/TeamSettings"));
const DocumentationPage = lazy(() => import("./pages/flow/Documentation"));
const GiveFeedbackPage = lazy(() => import("./pages/flow/GiveFeedback"));
const About = lazy(() => import("./pages/About"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const PlanningSystem = lazy(() => import("./pages/PlanningSystem"));
const Multiagentpage = lazy(() => import("./pages/Multiagentpage"));

const Settings = lazy(() => import("./pages/Settings"));
const SettingsBilling = lazy(() => import("./pages/SettingsBilling"));
const SettingsTeam = lazy(() => import("./pages/SettingsTeam"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
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

const HIDDEN_HEADER_PREFIXES = ["/flow", "/image-generator", "/planningsystem", "/multiagentpage", "/settings", "/invite"];

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
      {/* Public routes */}
      <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
      <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      
      {/* Protected routes - require authentication */}
      <Route path="/flow" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="selection" /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/prompt-generator" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="prompt-generator" initialWorkspace="prompt-generator" /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/color-codes" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage key="color-codes" initialWorkspace="color-codes" /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/team-settings" element={<ProtectedRoute><ErrorBoundary><TeamSettings /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/documentation" element={<ProtectedRoute><ErrorBoundary><DocumentationPage /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow/feedback" element={<ProtectedRoute><ErrorBoundary><GiveFeedbackPage /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/flow-engine" element={<ProtectedRoute><ErrorBoundary><FlowEnginePage /></ErrorBoundary></ProtectedRoute>} />
      
      <Route path="/image-generator" element={<ProtectedRoute><ImageGenerator /></ProtectedRoute>} />
      <Route path="/planningsystem" element={<ProtectedRoute><PlanningSystem /></ProtectedRoute>} />
      <Route path="/multiagentpage" element={<ProtectedRoute><Multiagentpage /></ProtectedRoute>} />
      
      {/* Settings routes - protected */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/settings/billing" element={<ProtectedRoute><SettingsBilling /></ProtectedRoute>} />
      <Route path="/settings/team" element={<ProtectedRoute><SettingsTeam /></ProtectedRoute>} />
      
      {/* Invite route - protected */}
      <Route path="/invite/:token" element={<ProtectedRoute><InviteAccept /></ProtectedRoute>} />
      
      <Route path="/payment-success" element={<ProtectedRoute><Layout><PaymentSuccess /></Layout></ProtectedRoute>} />
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
              <AuthDialogProvider>
                <PersistentHeader />
                <ScrollToTop />
                <Suspense fallback={null}><AppRoutes /></Suspense>
                <Suspense fallback={null}><CookieBanner /></Suspense>
              </AuthDialogProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
