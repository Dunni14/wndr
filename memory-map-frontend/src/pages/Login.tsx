import React, { useState } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signInWithEmail, signUpWithEmail } = useAuth()!;
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await signInWithEmail(email, password);
      if (!error) {
        navigate("/home");
      } else {
        setError(error.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signUpWithEmail(email, password, name);
      if (!error) {
        setError(null);
        // Show success message - user needs to confirm email
        setError("Check your email for a confirmation link!");
      } else {
        setError(error.message || "Signup failed");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-logo text-center mb-6">WNDR {mode === "login" ? "Login" : "Sign Up"}</h1>
        
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-purple-600 hover:underline text-sm"
                onClick={() => { setMode("signup"); setError(null); setEmail(""); setPassword(""); }}
                disabled={loading}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Create a password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            {error && (
              <div className={`text-sm p-2 rounded ${
                error.includes('Check your email') 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-500'
              }`}>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-purple-600 hover:underline text-sm"
                onClick={() => { setMode("login"); setError(null); setEmail(""); setPassword(""); setName(""); setConfirmPassword(""); }}
                disabled={loading}
              >
                Already have an account? Log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 