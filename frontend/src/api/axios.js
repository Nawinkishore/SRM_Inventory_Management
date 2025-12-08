import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Example: https://srm-backend-5aai.onrender.com/api
  withCredentials: true, // Required for cookies
});

export default api;
