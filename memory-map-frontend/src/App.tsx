import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import MapPage from "./pages/MapPage";
import Account from "./pages/Account";
import Memories from "./pages/Memories";

const Dashboard: React.FC = () => {
  const { user } = useAuth()!;
  return (
    <div className="min-h-screen flex items-center justify-center bg-mint">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-logo text-center mb-6">Welcome, {user?.phone || "User"}!</h1>
        <p className="text-center">You are logged in. (Dashboard placeholder)</p>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { token } = useAuth()!;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/map"
        element={token ? <MapPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/account"
        element={token ? <Account /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/memories"
        element={token ? <Memories /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={<Navigate to={token ? "/map" : "/login"} replace />}
      />
    </Routes>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
