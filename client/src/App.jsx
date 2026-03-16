
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DriverLogin from "./pages/driver/DriverLogin";
import LocationCheck from "./pages/driver/LocationCheck";
import DriverDetails from "./pages/driver/DriverDetails";
import DocumentUpload from "./pages/driver/DocumentUpload";
import DocumentReview from "./pages/driver/DocumentReview";
import SelfieVerification from "./pages/driver/SelfieVerification";
import CheckinSuccess from "./pages/driver/CheckinSuccess";

import GuardLogin from "./pages/guard/GuardLogin";
import GuardDashboard from "./pages/guard/GuardDashboard";
import GeoGuard from "./pages/guard/GeoGuard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors closeButton />

      <BrowserRouter>
        <Routes>

          {/* PUBLIC ROUTE */}
          <Route path="/" element={
            <GeoGuard>
              <Index />
            </GeoGuard>
          } />

          {/* ================= DRIVER ROUTES (GEOFENCED) ================= */}
          <Route path="/driver/login" element={
            <GeoGuard>
              <DriverLogin />
            </GeoGuard>
          } />
          <Route path="/driver/location" element={
            <GeoGuard>
              <LocationCheck />
            </GeoGuard>
          } />
          <Route path="/d" element={
            <GeoGuard>
              <DriverDetails />
            </GeoGuard>
          } />
          <Route path="/driver/documents" element={
            <GeoGuard>
              <DocumentUpload />
            </GeoGuard>
          } />
          <Route path="/driver/doc-review" element={
            <GeoGuard>
              <DocumentReview />
            </GeoGuard>
          } />
          <Route path="/driver/selfie" element={
            <GeoGuard>
              <SelfieVerification />
            </GeoGuard>
          } />
          <Route path="/driver/success" element={
            <GeoGuard>
              <CheckinSuccess />
            </GeoGuard>
          } />

          {/* ================= GUARD ROUTES (GEOFENCED) ================= */}
          <Route path="/guard/login" element={
            <GeoGuard>
              <GuardLogin />
            </GeoGuard>
          } />
          <Route path="/guard/dashboard" element={
            <GeoGuard>
              <GuardDashboard />
            </GeoGuard>
          } />

          {/* 404 */}
          <Route path="*" element={
            <GeoGuard>
              <NotFound />
            </GeoGuard>
          } />

        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;