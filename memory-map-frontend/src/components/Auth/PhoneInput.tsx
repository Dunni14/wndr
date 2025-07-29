import React from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
  loading?: boolean;
  error?: string | null;
}

const PhoneInputComponent: React.FC<PhoneInputProps> = ({ onSubmit, loading, error }) => {
  const [phone, setPhone] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit("+" + phone); // Ensures E.164 format
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
      <PhoneInput
        country={"us"}
        value={phone}
        onChange={setPhone}
        inputClass="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        inputProps={{
          name: "phone",
          required: true,
          autoFocus: true,
        }}
        disabled={loading}
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

export default PhoneInputComponent; 