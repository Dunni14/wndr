const BASE_URL = "http://192.168.1.100:3001"; // Replace with your local IP

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

export const fetchMemories = async () => {
  const res = await fetch(`${BASE_URL}/api/pins`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

export const addMemory = async (memory) => {
  const res = await fetch(`${BASE_URL}/api/pins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memory),
  });
  return res.json();
}; 