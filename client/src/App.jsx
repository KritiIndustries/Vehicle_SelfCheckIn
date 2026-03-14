
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

              <DriverLogin />

            }
          />
          <Route
            path="/driver/location"
            element={

              <LocationCheck />

            }
          />
          <Route
            path="/driver/d"
            element={

              <DriverDetails />

            }
          />
          <Route
            path="/driver/documents"
            element={

              <DocumentUpload />

            }
          />
          <Route
            path="/driver/doc-review"
            element={

              <DocumentReview />

            }
          />
          <Route
            path="/driver/selfie"
            element={

              <SelfieVerification />

            }
          />
          <Route
            path="/driver/success"
            element={

              <CheckinSuccess />

            }
          />

          {/* ================= GUARD ROUTES (GEOFENCED) ================= */}
          <Route
            path="/guard/login"
            element={

              <GuardLogin />

            }
          />
          <Route
            path="/guard/dashboard"
            element={

              <GuardDashboard />

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