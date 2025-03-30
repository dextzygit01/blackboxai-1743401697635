const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Enhanced proxy endpoint with better error handling
app.get('/api/rates', async (req, res) => {
  try {
    const { apiKey } = req.query;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      return res.status(400).json({ 
        error: 'Invalid API key',
        message: 'Please enter a valid API key in the settings'
      });
    }

    console.log('Fetching rates from API with key:', apiKey.slice(0, 4) + '...');
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
      timeout: 5000 // 5 second timeout
    });

    if (!response.data || !response.data.rates) {
      throw new Error('Invalid API response format');
    }

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Provide more detailed error messages
    let status = 500;
    let message = 'Failed to fetch exchange rates';
    
    if (error.response) {
      status = error.response.status;
      message = `API responded with ${status}`;
    } else if (error.request) {
      message = 'No response from exchange rate API';
    } else if (error.code === 'ECONNABORTED') {
      message = 'API request timed out';
    }

    res.status(status).json({ 
      error: message,
      details: error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Ready to forward requests to exchange rate API`);
});