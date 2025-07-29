import React from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

interface SignupFormProps {
  onSubmit: (data: { phone: string; firstName: string; lastName: string; email: string }) => void;
  loading?: boolean;
  error?: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, loading, error }) => {
  const [phone, setPhone] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ phone: "+" + phone, firstName, lastName, email });
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
        }}
        disabled={loading}
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="First Name"
          required
          disabled={loading}
        />
        <input
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          className="w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Last Name"
          required
          disabled={loading}
        />
      </div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        placeholder="Email"
        required
        disabled={loading}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm; 