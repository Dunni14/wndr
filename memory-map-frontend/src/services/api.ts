const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const requestOTP = async (phone: string) => {
  const res = await fetch(`${BASE_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return res.json();
};

export const verifyOTP = async (phone: string, code: string, signupData?: any) => {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code, signupData }),
  });
  return res.json();
};

export const signup = async (data: { phone: string; firstName: string; lastName: string; email: string }) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProfile = async (data: { name: string; email: string }, token: string) => {
  const res = await fetch(`${BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getUserMemories = async (token: string) => {
  const res = await fetch(`${BASE_URL}/auth/memories`, {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  return res.json();
};

export const createMemory = async (data: {
  title: string;
  description: string;
  mood: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  visitDate: string;
}, token: string) => {
  console.log("createMemory called with:", { data, token: token ? "present" : "missing" });
  console.log("API URL:", `${BASE_URL}/auth/memories`);
  
  const res = await fetch(`${BASE_URL}/auth/memories`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  console.log("Response status:", res.status);
  const result = await res.json();
  console.log("Response data:", result);
  return result;
};

export const updateMemory = async (id: string, data: {
  title: string;
  description: string;
  mood: string;
  imageUrl?: string;
  visitDate: string;
}, token: string) => {
  const res = await fetch(`${BASE_URL}/auth/memories/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteMemory = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/auth/memories/${id}`, {
    method: "DELETE",
    headers: { 
      "Authorization": `Bearer ${token}`
    },
  });
  return res.json();
}; 