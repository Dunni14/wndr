import React, { useState } from "react";

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
  loading?: boolean;
  error?: string | null;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ onSubmit, loading, error }) => {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
      <input
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        placeholder="+1234567890"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
    </form>
  );
};

export default PhoneInput; 