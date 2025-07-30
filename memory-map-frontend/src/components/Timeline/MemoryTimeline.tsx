import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatShortDate } from '../../utils/dateUtils';

interface Memory {
  id?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  title?: string;
  description?: string;
  visitDate?: string;
}

interface TimelineGroup {
  period: string;
  memories: Memory[];
  year: number;
  month?: number;
}

interface MemoryTimelineProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onClose: () => void;
  isOpen: boolean;
}

const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  memories,
  onMemoryClick,
  onClose,
  isOpen
}) => {
  const [groupBy, setGroupBy] = useState<'month' | 'year'>('month');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Group memories by time period
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: Memory[] } = {};
    
    memories.forEach(memory => {
      if (!memory.visitDate) return;
      
      const date = new Date(memory.visitDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      let key: string;
      if (groupBy === 'month') {
        key = `${year}-${month.toString().padStart(2, '0')}`;
      } else {
        key = year.toString();
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(memory);
    });

    // Convert to timeline groups and sort
    const timelineGroups: TimelineGroup[] = Object.entries(groups).map(([key, memories]) => {
      if (groupBy === 'month') {
        const [year, month] = key.split('-').map(Number);
        return {
          period: new Date(year, month).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          }),
          memories: memories.sort((a, b) => {
            if (!a.visitDate || !b.visitDate) return 0;
            return sortOrder === 'desc' 
              ? new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
              : new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
          }),
          year: year,
          month: month
        };
      } else {
        const year = Number(key);
        return {
          period: year.toString(),
          memories: memories.sort((a, b) => {
            if (!a.visitDate || !b.visitDate) return 0;
            return sortOrder === 'desc' 
              ? new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
              : new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
          }),
          year: year
        };
      }
    });

    // Sort timeline groups
    return timelineGroups.sort((a, b) => {
      if (sortOrder === 'desc') {
        if (a.year !== b.year) return b.year - a.year;
        return (b.month || 0) - (a.month || 0);
      } else {
        if (a.year !== b.year) return a.year - b.year;
        return (a.month || 0) - (b.month || 0);
      }
    });
  }, [memories, groupBy, sortOrder]);

  const totalMemories = memories.length;
  const dateRange = useMemo(() => {
    if (memories.length === 0) return '';
    
    const dates = memories
      .filter(m => m.visitDate)
      .map(m => new Date(m.visitDate!))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length === 0) return '';
    
    const earliest = dates[0];
    const latest = dates[dates.length - 1];
    
    return `${earliest.getFullYear()} - ${latest.getFullYear()}`;
  }, [memories]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <style>{`
        .timeline-scroll {
          scrollbar-width: auto !important;
          scrollbar-color: #FF6B6B #F5F5F5 !important;
        }
        .timeline-scroll::-webkit-scrollbar {
          width: 12px !important;
          height: 12px !important;
        }
        .timeline-scroll::-webkit-scrollbar-track {
          background: #F5F5F5 !important;
          border-radius: 6px !important;
        }
        .timeline-scroll::-webkit-scrollbar-thumb {
          background: #FF6B6B !important;
          border-radius: 6px !important;
          border: 2px solid #F5F5F5 !important;
        }
        .timeline-scroll::-webkit-scrollbar-thumb:hover {
          background: #FF5252 !important;
        }
        .timeline-scroll::-webkit-scrollbar-corner {
          background: #F5F5F5 !important;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal bg-opacity-70 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Timeline Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl h-full max-h-[90vh] mx-4 bg-white rounded-2xl shadow-neu-sw overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-warmgray bg-cream flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-3xl">📅</span>
              <div>
                <h2 className="text-2xl font-bold text-charcoal">Memory Timeline</h2>
                <p className="text-warmgray">
                  {totalMemories} memories • {dateRange}
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-lg border border-warmgray overflow-hidden">
                <button
                  onClick={() => setGroupBy('month')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    groupBy === 'month' 
                      ? 'bg-coral text-white' 
                      : 'text-charcoal hover:bg-mint'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setGroupBy('year')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    groupBy === 'year' 
                      ? 'bg-coral text-white' 
                      : 'text-charcoal hover:bg-mint'
                  }`}
                >
                  Yearly
                </button>
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 rounded-lg bg-white border border-warmgray hover:bg-mint transition-colors"
                title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
              >
                <svg 
                  className={`w-5 h-5 text-charcoal transition-transform ${
                    sortOrder === 'desc' ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" 
                  />
                </svg>
              </button>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-coral hover:bg-opacity-80 transition-colors flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-scroll p-6 timeline-scroll" style={{ 
            scrollbarWidth: 'auto', 
            scrollbarColor: '#FF6B6B #F5F5F5',
            maxHeight: 'calc(90vh - 200px)'
          }}>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-mint"></div>
              
              {timelineGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.period}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="relative mb-8"
                >
                  {/* Period Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 bg-coral rounded-full border-4 border-white shadow-neu-btn relative z-10"></div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold text-charcoal">{group.period}</h3>
                      <p className="text-warmgray text-sm">{group.memories.length} memories</p>
                    </div>
                  </div>
                  
                  {/* Memory Cards */}
                  <div className="ml-10 space-y-3">
                    {group.memories.map((memory, memoryIndex) => (
                      <motion.button
                        key={memory.id || memoryIndex}
                        onClick={() => onMemoryClick(memory)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 bg-white border border-warmgray rounded-xl hover:shadow-neu-btn transition-all text-left group"
                      >
                        <div className="flex items-start gap-4">
                          {memory.imageUrl && (
                            <img
                              src={memory.imageUrl}
                              alt={memory.title || 'Memory'}
                              className="w-16 h-16 rounded-lg object-cover shadow-neu-in border-2 border-cream"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-charcoal group-hover:text-coral transition-colors">
                                  {memory.title || 'Untitled Memory'}
                                </h4>
                                <p className="text-sm text-warmgray mt-1 line-clamp-2">
                                  {memory.description || 'No description'}
                                </p>
                              </div>
                              <div className="text-xs text-warmgray flex-shrink-0 ml-4">
                                {formatShortDate(memory.visitDate)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-warmgray">
                              <span>📍</span>
                              <span>{memory.lat.toFixed(4)}, {memory.lng.toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
              
              {timelineGroups.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">No memories yet</h3>
                  <p className="text-warmgray">Start creating memories to see your timeline!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemoryTimeline;