const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const requestOTP = async (phone: string) => {
  const res = await fetch(`${BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return res.json();
};

export const verifyOTP = async (phone: string, code: string) => {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  return res.json();
}; 