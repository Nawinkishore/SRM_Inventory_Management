import axios from "axios";

// BACKEND URLs
const BACKEND_LOCAL = "http://localhost:5000/api";
const BACKEND_PROD = "https://srm-backend-5aai.onrender.com/api";

// FRONTEND ORIGINS
const FRONTEND_ALLOWED = [
  "http://localhost:5173",
  "https://srm-frontend-55p4.onrender.com"
];

// Detect which backend to use
const backendBaseURL = FRONTEND_ALLOWED.includes(window.location.origin)
  ? (window.location.origin === "http://localhost:5173"
      ? BACKEND_LOCAL
      : BACKEND_PROD)
  : BACKEND_PROD;

// Create axios instance
const api = axios.create({
  baseURL: backendBaseURL,
  withCredentials: true,
});

export default api;
