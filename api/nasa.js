const axios = require('axios');

module.exports = async (req, res) => {
  const { endpoint } = req.query;
  const API_KEY = process.env.NASA_API_KEY;

  try {
    const response = await axios.get(`https://api.nasa.gov/${endpoint}&api_key=${API_KEY}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from NASA API' });
  }
};