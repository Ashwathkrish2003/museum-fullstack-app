import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Attach Bearer token from localStorage to every request (if present)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
