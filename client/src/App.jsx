
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
import ValidateHomePage from "./pages/driver/ValidateHomePage";


const queryClient = new QueryClient();

const driverRadius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS_DRIVER) || 150;
const guardRadius = parseFloat(import.meta.env.VITE_GEOFENCE_RADIUS_GUARD) || 50;

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
          {/* <Route path="/driver/login" element={
            <GeoGuard>
              <DriverLogin />
            </GeoGuard>
          } /> */}
          <Route path="/driver/location" element={
            <GeoGuard radius={driverRadius}>
              <LocationCheck />
            </GeoGuard>
          } />
          <Route path="/d" element={
            <GeoGuard radius={driverRadius}>
              {/* <DriverDetails /> */}
              <ValidateHomePage />
            </GeoGuard>
          } />
          <Route path="/driver/documents" element={
            // <GeoGuard radius={driverRadius}>
            <DocumentUpload />
            // </GeoGuard>
          } />
          <Route path="/driver/doc-review" element={
            // <GeoGuard radius={driverRadius}>
            <DocumentReview />
            // </GeoGuard>
          } />
          <Route path="/driver/selfie" element={
            // <GeoGuard radius={driverRadius}>
            <SelfieVerification />
            // </GeoGuard>
          } />
          <Route path="/driver/success" element={
            // <GeoGuard radius={driverRadius}>
            <CheckinSuccess />
            // </GeoGuard>
          } />

          {/* ================= GUARD ROUTES (GEOFENCED) ================= */}
          <Route path="/guard/login" element={
            <GeoGuard radius={guardRadius}>
              <GuardLogin />
            </GeoGuard>
          } />
          <Route path="/guard/dashboard" element={
            <GeoGuard radius={guardRadius}>
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