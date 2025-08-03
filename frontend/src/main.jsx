import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientFiles from "./pages/PatientFiles";
import PatientAccesslist from "./pages/PatientAccesslist";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import AIChat from "./pages/AIChat";
import { ThemeProvider } from "./components/ui/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CompleteProfile from "./pages/CompleteProfile";
import ResetPassword from "./pages/ResetPassword";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_Google_Client_ID}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<PatientFiles />} />
          <Route path="/accesslist" element={<PatientAccesslist />} />
          <Route path="/prescriptions" element={<PatientPrescriptions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/ai" element={<AIChat />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
