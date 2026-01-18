const axios = require('axios');

// Use 127.0.0.1 for local communication between servers
const AI_API_URL = 'http://127.0.0.1:5001/predict'; 

const getPricePrediction = async (data) => {
    try {
        const response = await axios.post(AI_API_URL, {
            product: data.name.toLowerCase(),
            quality: data.quality || "medium",
            season: data.season || "kharif",
            state: data.state.toLowerCase(),
            quantity: parseFloat(data.quantity),
            market_distance: 50, // Default value
            organic_certified: 0  // Default value
        });

        // Returning the specific price value from your model's output
        return response.data.price_per_quintal;
    } catch (error) {
        console.error("AI Bridge Error:", error.message);
        throw new Error("Could not reach AI Prediction Engine");
    }
};

module.exports = { getPricePrediction };