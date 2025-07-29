import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MemoryEditFormProps {
  memory: {
    id?: string;
    title?: string;
    description?: string;
    mood?: string;
    visitDate?: string;
    imageUrl?: string;
  };
  onSave: (updatedData: {
    title: string;
    description: string;
    mood: string;
    visitDate: string;
    imageUrl?: string;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const MemoryEditForm: React.FC<MemoryEditFormProps> = ({
  memory,
  onSave,
  onCancel,
  onDelete,
  loading = false
}) => {
  const [title, setTitle] = useState(memory.title || '');
  const [description, setDescription] = useState(memory.description || '');
  const [mood, setMood] = useState(memory.mood || '');
  const [visitDate, setVisitDate] = useState(
    memory.visitDate ? new Date(memory.visitDate).toISOString().slice(0, 10) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      mood,
      visitDate,
      imageUrl: memory.imageUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full relative z-10 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-charcoal">Edit Memory</h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Image Preview */}
        {memory.imageUrl && (
          <div className="mb-4">
            <img
              src={memory.imageUrl}
              alt="Memory"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
              disabled={loading}
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Mood
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
              disabled={loading}
            >
              <option value="">Select mood</option>
              <option value="happy">Happy</option>
              <option value="peaceful">Peaceful</option>
              <option value="adventurous">Adventurous</option>
              <option value="nostalgic">Nostalgic</option>
              <option value="excited">Excited</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Visit Date
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-2 border border-warmgray rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 bg-gray-200 text-charcoal py-2 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MemoryEditForm;