import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientFiles from "./pages/PatientFiles";
import PatientAccesslist from "./pages/PatientAccesslist";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<PatientFiles />} />
      <Route path="/accesslist" element={<PatientAccesslist />} />
    </Routes>
  </BrowserRouter>
);
