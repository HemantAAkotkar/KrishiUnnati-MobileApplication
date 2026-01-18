// Just change this ONE variable when your WiFi IP changes
// export const BASE_URL = "http://192.168.135.153:5000";
export const BASE_URL = "http://10.189.48.153:5000";

export const API_ROUTES = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  PREDICT_PRICE: `${BASE_URL}/api/ai/predict-price`,
  UPLOAD_IMAGE: `${BASE_URL}/api/products/upload`,
  ADD_PRODUCT: `${BASE_URL}/api/products/add`,
};