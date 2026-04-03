// Just change this ONE variable when your WiFi IP changes
export const BASE_URL = "http://10.123.137.153:5000";
// export const BASE_URL = "http://10.199.204.153:5000";

export const API_ROUTES = {
  LOGIN: `${BASE_URL}/api/auth/login`,
  PREDICT_PRICE: `${BASE_URL}/api/ai/predict-price`,
  UPLOAD_IMAGE: `${BASE_URL}/api/products/upload`,
  ADD_PRODUCT: `${BASE_URL}/api/products/add`,
};

// App_Frontend/config.js
export const BlockChainURL = "http://10.123.137.153:5005";

export const API_HEADERS = {
    
    'Content-Type': 'application/json',
};
