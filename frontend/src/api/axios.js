import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: baseURL, // Example: https://srm-backend-5aai.onrender.com/api
  withCredentials: true, // Required for cookies
});

export default api;
