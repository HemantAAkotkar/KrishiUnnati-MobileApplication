const express = require('express');
const { predictPrice } = require('../controllers/ai.controller');
const router = express.Router();

router.post('/predict-price', predictPrice);

module.exports = router;