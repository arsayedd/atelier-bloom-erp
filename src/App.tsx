
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ClientsPage from "./pages/ClientsPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><DashboardLayout><CalendarPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><DashboardLayout><ClientsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><DashboardLayout><OrdersPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><InventoryPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><DashboardLayout><PaymentsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
