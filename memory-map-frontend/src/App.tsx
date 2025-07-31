import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/SupabaseAuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import Account from "./pages/Account";
import Memories from "./pages/Memories";

const Dashboard: React.FC = () => {
  const { user } = useAuth()!;
  return (
    <div className="min-h-screen flex items-center justify-center bg-mint">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-logo text-center mb-6">Welcome, {user?.phone || user?.email || "User"}!</h1>
        <p className="text-center">You are logged in. (Dashboard placeholder)</p>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth()!;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/map"
        element={user ? <MapPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/account"
        element={user ? <Account /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/memories"
        element={user ? <Memories /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} replace />}
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
