import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import KidLayout from "@/components/KidLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ParentDashboard from "@/pages/ParentDashboard";
import Tasks from "@/pages/Tasks";
import Wallet from "@/pages/Wallet";
import Goals from "@/pages/Goals";
import SIP from "@/pages/SIP";
import Loans from "@/pages/Loans";
import Learning from "@/pages/Learning";
import Settings from "@/pages/Settings";
import KidHome from "@/pages/kid/KidHome";
import KidTasks from "@/pages/kid/KidTasks";
import KidWallet from "@/pages/kid/KidWallet";
import KidGoals from "@/pages/kid/KidGoals";
import KidSIP from "@/pages/kid/KidSIP";
import KidLoans from "@/pages/kid/KidLoans";
import KidLearning from "@/pages/kid/KidLearning";
import KidAchievements from "@/pages/kid/KidAchievements";

function ParentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "kid") return <Navigate to="/kid/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function KidRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "kid") return <Navigate to="/dashboard" replace />;
  return <KidLayout>{children}</KidLayout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === "kid" ? "/kid/dashboard" : "/dashboard"} replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Parent routes */}
            <Route path="/dashboard" element={<ParentRoute><ParentDashboard /></ParentRoute>} />
            <Route path="/tasks" element={<ParentRoute><Tasks /></ParentRoute>} />
            <Route path="/wallet" element={<ParentRoute><Wallet /></ParentRoute>} />
            <Route path="/goals" element={<ParentRoute><Goals /></ParentRoute>} />
            <Route path="/sip" element={<ParentRoute><SIP /></ParentRoute>} />
            <Route path="/loans" element={<ParentRoute><Loans /></ParentRoute>} />
            <Route path="/learning" element={<ParentRoute><Learning /></ParentRoute>} />
            <Route path="/settings" element={<ParentRoute><Settings /></ParentRoute>} />

            {/* Kid routes */}
            <Route path="/kid/dashboard" element={<KidRoute><KidHome /></KidRoute>} />
            <Route path="/kid/tasks" element={<KidRoute><KidTasks /></KidRoute>} />
            <Route path="/kid/wallet" element={<KidRoute><KidWallet /></KidRoute>} />
            <Route path="/kid/goals" element={<KidRoute><KidGoals /></KidRoute>} />
            <Route path="/kid/sip" element={<KidRoute><KidSIP /></KidRoute>} />
            <Route path="/kid/loans" element={<KidRoute><KidLoans /></KidRoute>} />
            <Route path="/kid/learning" element={<KidRoute><KidLearning /></KidRoute>} />
            <Route path="/kid/achievements" element={<KidRoute><KidAchievements /></KidRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
