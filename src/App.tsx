import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProductInput from "./pages/ProductInput";
import Hypothesis from "./pages/Hypothesis";
import ResearchPlan from "./pages/ResearchPlan";
import Instruments from "./pages/Instruments";
import DataInsights from "./pages/DataInsights";
import Analysis from "./pages/Analysis";
import Report from "./pages/Report";
import MarketingStudio from "./pages/MarketingStudio";
import ABTestPredictor from "./pages/ABTestPredictor";
import SurveyAutomation from "./pages/SurveyAutomation";
import SurveyResponse from "./pages/SurveyResponse";
import SurveyResponseHandler from "./pages/SurveyResponseHandler";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/survey/:surveyId" element={<SurveyResponse />} />
          <Route path="/survey/respond" element={<SurveyResponseHandler />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/product-input" element={<ProtectedRoute><ProductInput /></ProtectedRoute>} />
          <Route path="/hypothesis" element={<ProtectedRoute><Hypothesis /></ProtectedRoute>} />
          <Route path="/research-plan" element={<ProtectedRoute><ResearchPlan /></ProtectedRoute>} />
          <Route path="/instruments" element={<ProtectedRoute><Instruments /></ProtectedRoute>} />
            <Route path="/data-insights" element={<ProtectedRoute><DataInsights /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/ab-test-predictor" element={<ProtectedRoute><ABTestPredictor /></ProtectedRoute>} />
            <Route path="/survey-automation" element={<ProtectedRoute><SurveyAutomation /></ProtectedRoute>} />
          <Route path="/marketing-studio" element={<ProtectedRoute><MarketingStudio /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
