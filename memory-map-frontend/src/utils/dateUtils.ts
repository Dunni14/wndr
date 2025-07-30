/**
 * Utility functions for date formatting
 */

export const formatMemoryDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatShortDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatRelativeDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date < now ? 'Yesterday' : 'Tomorrow';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays < 7) {
      return `${diffDays} days ${date < now ? 'ago' : 'from now'}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ${date < now ? 'ago' : 'from now'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ${date < now ? 'ago' : 'from now'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ${date < now ? 'ago' : 'from now'}`;
    }
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return new Date().toISOString().slice(0, 10);
  
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
  } catch (error) {
    return new Date().toISOString().slice(0, 10);
  }
};