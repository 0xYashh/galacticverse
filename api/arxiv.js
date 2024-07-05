const axios = require('axios');

module.exports = async (req, res) => {
  const { searchTerm } = req.query;
  try {
    const response = await axios.get(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(searchTerm)}&start=0&max_results=10`);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from arXiv API' });
  }
};