

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster position="top-center" richColors closeButton />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />
//           <Route path="/driver/login" element={<DriverLogin />} />
//           <Route path="/driver/location" element={<LocationCheck />} />
//           <Route path="/driver/details" element={<DriverDetails />} />
//           <Route path="/driver/documents" element={<DocumentUpload />} />
//           <Route path="/driver/selfie" element={<SelfieVerification />} />
//           <Route path="/driver/success" element={<CheckinSuccess />} />
//           <Route path="/guard/login" element={<GuardLogin />} />
//           <Route path="/guard/dashboard" element={<GuardDashboard />} />
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;

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
          <Route path="/" element={<Index />} />

          {/* ================= DRIVER ROUTES (GEOFENCED) ================= */}
          <Route
            path="/driver/login"
            element={
              <GeoGuard>
                <DriverLogin />
              </GeoGuard>
            }
          />
          <Route
            path="/driver/location"
            element={
              <GeoGuard>
                <LocationCheck />
              </GeoGuard>
            }
          />
          <Route
            path="/driver/details"
            element={
              <GeoGuard>
                <DriverDetails />
              </GeoGuard>
            }
          />
          <Route
            path="/driver/documents"
            element={
              <GeoGuard>
                <DocumentUpload />
              </GeoGuard>
            }
          />
          <Route
            path="/driver/selfie"
            element={
              <GeoGuard>
                <SelfieVerification />
              </GeoGuard>
            }
          />
          <Route
            path="/driver/success"
            element={
              <GeoGuard>
                <CheckinSuccess />
              </GeoGuard>
            }
          />

          {/* ================= GUARD ROUTES (GEOFENCED) ================= */}
          <Route
            path="/guard/login"
            element={
              <GeoGuard>
                <GuardLogin />
              </GeoGuard>
            }
          />
          <Route
            path="/guard/dashboard"
            element={
              <GeoGuard>
                <GuardDashboard />
              </GeoGuard>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;