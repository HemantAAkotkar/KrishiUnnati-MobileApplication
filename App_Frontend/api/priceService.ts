// api/priceService.ts
import axios from "axios";

const AI_BASE_URL = "http://localhost:5001"; // ⚠️ Replace with your system’s IP running the AI model

export const predictPrice = async (payload) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/predict`, payload);
    if (response.data.success) {
      return response.data.prediction;
    } else {
      throw new Error("Prediction failed");
    }
  } catch (error) {
    console.error("Price prediction error:", error.response?.data || error.message);
    throw error;
  }
};
