import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: baseURL,
});

export default api;