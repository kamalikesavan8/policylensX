import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "../context/AuthContext";
import { AppLayout } from "../layouts/AppLayout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import Results from "../pages/Results";
import History from "../pages/History";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import { DocumentProvider } from "../context/DocumentContext";
import { NotificationProvider } from "../context/NotificationContext";

export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated app */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/upload" replace />} />
            <Route path="upload" element={<Upload />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="results/:id?" element={<Results />} />
            <Route path="history" element={<History />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
      </DocumentProvider>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
