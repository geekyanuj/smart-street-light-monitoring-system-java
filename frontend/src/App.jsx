import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MapView from "./pages/MapView";
import Analytics from "./pages/Analytics";
import LiveSensors from "./pages/LiveSensors";
import DeviceDetails from "./pages/DeviceDetails";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Helper to check authentication
const isAuthenticated = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    return !!(auth && auth.token);
  } catch (e) {
    return false;
  }
};

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-[70] transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-50 w-full h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 lg:hidden text-slate-500 hover:text-slate-900 transition-colors"
             >
               <Menu size={20} />
             </button>
             <div className="lg:hidden font-black text-blue-600 tracking-tighter text-xl">SSLMS</div>
           </div>
           
           <Navbar />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MapView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/live"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveSensors />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/device/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DeviceDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
