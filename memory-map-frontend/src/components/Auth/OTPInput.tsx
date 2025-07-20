import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | null;
}

const OTPInput: React.FC<OTPInputProps> = ({ onSubmit, loading, error }) => {
  const [code, setCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
      <input
        ref={inputRef}
        type="text"
        value={code}
        onChange={e => setCode(e.target.value)}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring tracking-widest text-center"
        placeholder="123456"
        required
        maxLength={6}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );
};

export default OTPInput; 