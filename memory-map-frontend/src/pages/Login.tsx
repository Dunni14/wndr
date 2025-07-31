import React, { useState } from "react";
import PhoneInput from "../components/Auth/PhoneInput";
import { useAuth } from "../context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/Auth/SignupForm";

const Login: React.FC = () => {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [_signupData, setSignupData] = useState<any>(null);
  const { signInWithPhone, verifyOTP } = useAuth()!;
  const navigate = useNavigate();

  const handlePhoneSubmit = async (phoneValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await signInWithPhone(phoneValue);
      if (!error) {
        setPhone(phoneValue);
        setOtpRequested(true);
        setStep("verify");
      } else {
        setError(error.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (val: string) => {
    setCode(val);
  };

  const handleOTPSubmit = async () => {
    if (loading) return; // debounce: skip if already loading
    setLoading(true);
    setError(null);
    try {
      const { error } = await verifyOTP(phone, code);
      if (!error) {
        navigate("/home"); // redirect to WNDR home page
      } else {
        setError(error.message || "OTP verification failed");
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: { phone: string; firstName: string; lastName: string; email: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Store signup data for after OTP verification
      setSignupData({ 
        name: `${data.firstName} ${data.lastName}`, 
        email: data.email 
      });
      
      const { error } = await signInWithPhone(data.phone);
      if (!error) {
        setPhone(data.phone);
        setOtpRequested(true);
        setStep("verify");
        setMode("login"); // Switch to login for OTP
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
      <div className="bg-white p-4 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-logo text-center mb-6">WNDR {mode === "login" ? "Login" : "Sign Up"}</h1>
        {mode === "login" ? (
          step === "request" ? (
            <>
              <PhoneInput onSubmit={handlePhoneSubmit} loading={loading} error={error} />
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => { setMode("signup"); setError(null); }}
                  disabled={loading}
                >
                  Don&apos;t have an account? Sign up
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleOTPSubmit();
              }}
              className="space-y-4 max-w-xs mx-auto"
            >
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input
                type="text"
                value={code}
                onChange={e => handleOTPChange(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring tracking-widest text-center"
                placeholder="123456"
                required
                maxLength={6}
                disabled={loading}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                disabled={loading || code.length !== 6 || !otpRequested}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )
        ) : (
          <>
            <SignupForm onSubmit={handleSignup} loading={loading} error={error} />
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => { setMode("login"); setError(null); }}
                disabled={loading}
              >
                Already have an account? Log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login; 