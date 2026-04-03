// api/authService.js
import axios from "axios";
import { API_HEADERS } from "@/constants/config";
const BASE_URL = `http://10.123.137.153:5000/api/auth`

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Add this logger to your code to see EXACTLY where it's trying to connect
API.interceptors.request.use(request => {
  console.log('🚀 Sending Request to:', request.baseURL + request.url);
  return request;
});

export const loginUser = async (credentials) => {
  try {
    const response = await API.post('/login', credentials,{
      headers:API_HEADERS
    });
    return response.data;
  } catch (error) {
    console.error("❌ API ERROR:", error.message);
    throw error;
  }
};
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/register", userData,{
      headers: API_HEADERS
    });
    return response.data;
  } catch (error) {
    // Professional error logging
    console.error("Registration API Error:", error.response?.data || error.message);
    throw error;
  }
};