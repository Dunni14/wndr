import React, { useState } from "react";
import PhoneInput from "../components/Auth/PhoneInput";
import OTPInput from "../components/Auth/OTPInput";
import { requestOTP as apiRequestOTP, verifyOTP as apiVerifyOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/Auth/SignupForm";
import { signup } from "../services/api";

const Login: React.FC = () => {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupData, setSignupData] = useState<any>(null);
  const { login } = useAuth()!;
  const navigate = useNavigate();

  const handlePhoneSubmit = async (phoneValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequestOTP(phoneValue);
      if (res.message === "OTP sent") {
        setPhone(phoneValue);
        setOtpRequested(true);
        setStep("verify");
      } else {
        setError(res.error || "Failed to send OTP");
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
    // Extra log for debugging double submissions
    console.log("OTP verify attempt", { phone, code, time: new Date().toISOString() });
    try {
      const res = await apiVerifyOTP(phone, code, signupData);
      console.log("verifyOTP response", res);
      if (res.token) {
        login(res.user, res.token);
        navigate("/home"); // redirect to WNDR home page
      } else {
        setError(res.error || "OTP verification failed");
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
      const res = await signup(data);
      if (res.message === "OTP sent") {
        setPhone(data.phone);
        setSignupData(data); // Store signup data for OTP verification
        setOtpRequested(true);
        setStep("verify");
        setMode("login"); // Switch to login for OTP
      } else {
        setError(res.error || "Signup failed");
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