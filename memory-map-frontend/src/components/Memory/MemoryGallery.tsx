import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Memory {
  id?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  title?: string;
  description?: string;
  visitDate?: string;
}

interface MemoryGalleryProps {
  memories: Memory[];
  onClose: () => void;
  onSelectMemory: (memory: Memory) => void;
  onEditMemory?: (memory: Memory) => void;
}

const MemoryGallery: React.FC<MemoryGalleryProps> = ({ memories, onClose, onSelectMemory, onEditMemory }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto"
          onClick={onClose}
        />
        {/* Gallery Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 shadow-lg relative pointer-events-auto max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-charcoal">
              {memories.length} {memories.length === 1 ? 'Memory' : 'Memories'} at this location
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-charcoal"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map((memory, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-cream rounded-lg p-4 shadow-neu-btn hover:shadow-neu-in transition-all cursor-pointer relative group"
                  onClick={() => onSelectMemory(memory)}
                >
                  {/* Image */}
                  {memory.imageUrl ? (
                    <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                      <img
                        src={memory.imageUrl}
                        alt={memory.title || 'Memory'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square mb-3 bg-warmgray rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-12 h-12 text-white"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Memory Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-charcoal text-sm mb-1 line-clamp-2">
                      {memory.title || 'Untitled Memory'}
                    </h3>
                    <p className="text-warmgray text-xs mb-2 line-clamp-2">
                      {memory.description || 'No description'}
                    </p>
                    <div className="text-xs text-coral font-medium">
                      {memory.visitDate ? new Date(memory.visitDate).toLocaleDateString() : 'No date'}
                    </div>
                  </div>

                  {/* Edit Button - appears on hover */}
                  {onEditMemory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMemory(memory);
                      }}
                      className="absolute top-2 right-2 bg-coral text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-90"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-3 h-3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemoryGallery;