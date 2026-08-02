import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import FaceRecognition from "@/pages/FaceRecognition";
import ProductRecognition from "@/pages/ProductRecognition";
import ReviewSentiment from "@/pages/ReviewSentiment";
import Chatbot from "@/pages/Chatbot";
import CustomerManagement from "@/pages/CustomerManagement";
import ProductManagement from "@/pages/ProductManagement";
import Analytics from "@/pages/Analytics";
import AdminPanel from "@/pages/AdminPanel";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/face-recognition" element={<RequireAuth><FaceRecognition /></RequireAuth>} />
      <Route path="/product-recognition" element={<RequireAuth><ProductRecognition /></RequireAuth>} />
      <Route path="/review-sentiment" element={<RequireAuth><ReviewSentiment /></RequireAuth>} />
      <Route path="/chatbot" element={<RequireAuth><Chatbot /></RequireAuth>} />
      <Route path="/customers" element={<RequireAuth><CustomerManagement /></RequireAuth>} />
      <Route path="/products" element={<RequireAuth><ProductManagement /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
