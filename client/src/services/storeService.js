import api from './api';

export const storeService = {
  // Get all stores with pagination and search
  getAllStores: async (params = {}) => {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  // Get store by ID
  getStoreById: async (id) => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  // Create new store (Admin only)
  createStore: async (storeData) => {
    const response = await api.post('/stores', storeData);
    return response.data;
  },

  // Update store
  updateStore: async (id, storeData) => {
    const response = await api.put(`/stores/${id}`, storeData);
    return response.data;
  },

  // Delete store (Admin only)
  deleteStore: async (id) => {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  },

  // Get my stores (Store owner)
  getMyStores: async (params = {}) => {
    const response = await api.get('/stores/owner/my-stores', { params });
    return response.data;
  },
};

export default storeService;