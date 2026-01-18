import axios from "axios";

const BASE_URL = "http://<your-backend-domain-or-ip>/api/ai";

export const getPredictedPrice = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/price-predict`, data);
    return res.data.predicted_price || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getRecommendations = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/recommend`, data);
    return res.data.recommendations || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
