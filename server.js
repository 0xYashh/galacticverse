const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/galactiverse_forum', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/api/forum', require('./api/forum'));

app.get('/features/forum', (req, res) => {
  res.sendFile(path.join(__dirname, 'features', 'forum.html'));
});

app.get('/discussion/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'discussion.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});