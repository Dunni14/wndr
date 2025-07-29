import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/api";

const Account: React.FC = () => {
  const { user, token, logout, updateUser } = useAuth()!;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const response = await updateProfile(
        { 
          name: editedName, 
          email: editedEmail 
        }, 
        token!
      );
      
      if (response.user) {
        updateUser(response.user);
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(response.error || "Failed to update profile");
      }
    } catch (error: any) {
      setSaveError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-neu-sw p-6 mt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/map")}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-charcoal"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-charcoal">Account</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-charcoal"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full shadow-neu-in bg-coral flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-12 h-12 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-warmgray mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
                placeholder="Enter your name"
              />
            ) : (
              <div className="w-full px-3 py-2 bg-mint rounded-lg text-charcoal">
                {user?.name || "No name set"}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-warmgray mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
                placeholder="Enter your email"
              />
            ) : (
              <div className="w-full px-3 py-2 bg-mint rounded-lg text-charcoal">
                {user?.email || "No email set"}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-warmgray mb-1">Phone Number</label>
            <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-charcoal">
              {user?.phone || "No phone number"}
            </div>
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-warmgray mb-1">Member Since</label>
            <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-charcoal">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Profile updated successfully!
          </div>
        )}
        {saveError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-coral text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition shadow-neu-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full bg-warmgray text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition shadow-neu-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;