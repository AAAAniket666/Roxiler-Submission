// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    return formatDate(dateString);
  }
};

// Truncate text to specified length
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format user role for display
export const formatRole = (role) => {
  switch (role) {
    case 'store_owner':
      return 'Store Owner';
    case 'admin':
      return 'Admin';
    case 'user':
      return 'User';
    default:
      return capitalize(role);
  }
};

// Generate avatar initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 16) {
    errors.push('Password cannot exceed 16 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password),
  };
};

// Get password strength level
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;
  
  // Character types
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

// Format rating display
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0';
  return parseFloat(rating).toFixed(1);
};

// Generate star rating display
export const generateStars = (rating, maxStars = 5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('★');
  }
  
  if (hasHalfStar && fullStars < maxStars) {
    stars.push('☆');
  }
  
  while (stars.length < maxStars) {
    stars.push('☆');
  }
  
  return stars;
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get role-based navigation items
export const getNavigationItems = (userRole) => {
  const baseItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'user', 'store_owner'] },
    { name: 'Stores', path: '/stores', roles: ['admin', 'user', 'store_owner'] },
  ];
  
  const roleSpecificItems = {
    admin: [
      { name: 'Users', path: '/admin/users', roles: ['admin'] },
      { name: 'Analytics', path: '/admin/analytics', roles: ['admin'] },
    ],
    store_owner: [
      { name: 'My Stores', path: '/store-owner/stores', roles: ['store_owner'] },
      { name: 'Ratings', path: '/store-owner/ratings', roles: ['store_owner'] },
    ],
    user: [
      { name: 'My Ratings', path: '/user/ratings', roles: ['user'] },
    ],
  };
  
  return [
    ...baseItems.filter(item => item.roles.includes(userRole)),
    ...(roleSpecificItems[userRole] || []),
  ];
};

export default {
  formatDate,
  formatRelativeTime,
  truncateText,
  capitalize,
  formatRole,
  getInitials,
  isValidEmail,
  validatePassword,
  getPasswordStrength,
  formatRating,
  generateStars,
  debounce,
  formatNumber,
  getNavigationItems,
};