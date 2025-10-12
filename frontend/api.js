// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
  timeout: 10000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (userData) => API.post("/auth/signup", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);

// Medicines
export const getMedicines = () => API.get("/medicines");
export const addMedicine = (data) => API.post("/medicines", data);

// Medical Equipments
export const getEquipments = () => API.get("/equipments");
export const addEquipment = (data) => API.post("/equipments", data);

// Profile - FIXED ENDPOINTS
export const getProfile = () => API.get("/profile/me");
export const updateProfile = (data) => API.put("/profile/update", data);

// Donate Rent
export const donateItem = (data) => API.post("/donaterent", data);
export const getDonations = () => API.get("/donaterent");

export default API;