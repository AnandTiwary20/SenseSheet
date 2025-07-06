import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Chart API methods
const chartAPI = {
  // Get all charts for a user
  getCharts: (userId) => api.get(`/charts/${userId}`),
  
  // Get a single chart
  getChart: (id) => api.get(`/charts/chart/${id}`),
  
  // Save a new chart
  saveChart: (chartData) => api.post('/charts', chartData),
  
  // Update an existing chart
  updateChart: (id, chartData) => api.put(`/charts/${id}`, chartData),
  
  // Delete a chart
  deleteChart: (id) => api.delete(`/charts/${id}`),
};

export default chartAPI;
