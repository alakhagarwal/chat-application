import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  // Default Spring Boot port is 8080. Update if your backend runs on a different port.
  baseURL: 'http://localhost:8080',
});


export default api;