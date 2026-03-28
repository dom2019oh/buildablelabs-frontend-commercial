import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import DashboardUsage from "./pages/DashboardUsage";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardProject from "./pages/DashboardProject";
import DashboardProjectSettings from "./pages/DashboardProjectSettings";
import DashboardTemplates from "./pages/DashboardTemplates";
import DashboardComponents from "./pages/DashboardComponents";
import DashboardBackgrounds from "./pages/DashboardBackgrounds";
import Docs from "./pages/Docs";
import Explore from "./pages/Explore";
import ProjectWorkspaceV2 from "./components/workspace/ProjectWorkspaceV2";
import ProjectWorkspaceV3 from "./components/workspace/ProjectWorkspaceV3";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Onboarding from "./pages/Onboarding";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Careers from "@/pages/Careers";
import Tutorials from "@/pages/Tutorials";
import Community from "@/pages/Community";
import Changelog from "@/pages/Changelog";
import BotBuilder from "@/pages/BotBuilder";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CookieConsent from "./components/CookieConsent";
import LogoPreview from "./pages/LogoPreview";
import DashboardExplore from "./pages/DashboardExplore";
import AdPreview from "./pages/AdPreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <Routes>
            <Route path="/" element={
              window.location.hostname === 'dashboard.buildablelabs.dev'
                ? <Navigate to="/dashboard" replace />
                : <Index />
            } />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/log-in" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/usage" element={<ProtectedRoute><DashboardUsage /></ProtectedRoute>} />
            <Route path="/dashboard/billing" element={<Navigate to="/dashboard/settings?tab=billing" replace />} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/dashboard/project/:projectId" element={<ProtectedRoute><DashboardProject /></ProtectedRoute>} />
            <Route path="/dashboard/project/:projectId/settings" element={<ProtectedRoute><DashboardProjectSettings /></ProtectedRoute>} />
            {/* Library Routes - Templates public, Components/Backgrounds protected */}
            <Route path="/dashboard/templates" element={<DashboardTemplates />} />
            <Route path="/dashboard/components" element={<ProtectedRoute><DashboardComponents /></ProtectedRoute>} />
            <Route path="/dashboard/backgrounds" element={<ProtectedRoute><DashboardBackgrounds /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/project/:projectId" element={<ProtectedRoute><ProjectWorkspaceV3 /></ProtectedRoute>} />
            {/* V2 kept as fallback — remove once V3 is stable */}
            <Route path="/project/:projectId/v2" element={<ProtectedRoute><ProjectWorkspaceV2 /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/community" element={<Community />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/bot-builder" element={<BotBuilder />} />
            <Route path="/logo-preview" element={<LogoPreview />} />
            <Route path="/ad-preview" element={<AdPreview />} />
            <Route path="/dashboard/explore" element={<ProtectedRoute><DashboardExplore /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
