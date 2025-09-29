import api from './api';

export const ratingService = {
  // Submit or update rating
  submitRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  // Get ratings for a specific store
  getStoreRatings: async (storeId, params = {}) => {
    const response = await api.get(`/ratings/store/${storeId}`, { params });
    return response.data;
  },

  // Get user's ratings
  getMyRatings: async (params = {}) => {
    const response = await api.get('/ratings/my-ratings', { params });
    return response.data;
  },

  // Get user's rating for a specific store
  getMyStoreRating: async (storeId) => {
    const response = await api.get(`/ratings/my-rating/store/${storeId}`);
    return response.data;
  },

  // Delete rating
  deleteRating: async (id) => {
    const response = await api.delete(`/ratings/${id}`);
    return response.data;
  },
};

export default ratingService;