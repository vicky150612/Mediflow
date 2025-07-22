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

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<PatientFiles />} />
      <Route path="/accesslist" element={<PatientAccesslist />} />
      <Route path="/prescriptions" element={<PatientPrescriptions />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/ai" element={<AIChat />} />
    </Routes>
  </BrowserRouter>
);
