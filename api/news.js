const axios = require('axios');

module.exports = async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching news' });
  }
};