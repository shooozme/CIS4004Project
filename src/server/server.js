const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// This is middleware. Middleware is like a filter that processes requests before they reach the route handlers.
app.use(cors());
app.use(express.json());

// Connect to MongoDB.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes. These are the endpoints that the server will respond to.
app.get('/', (req, res) => {
  res.send('Calendar API is running. Use /api/users or /api/events to access the API endpoints.');
});
app.use('/api/users', require('./src/routes/users'));
app.use('/api/groups', require('./src/routes/groups'));
app.use('/api/events', require('./src/routes/events'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));