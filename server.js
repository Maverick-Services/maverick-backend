const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const pingModel = require('./pingModel'); // Import the ping model script

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true ,  serverSelectionTimeoutMS: 5000})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json("API is running...");
});

app.use('/api/chat', chatRoutes);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Set server timeout to 10 minutes
server.setTimeout(10 * 60 * 1000); // 10 minutes

// Start the ping service
pingModel();

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const chatRoutes = require('./routes/chat');
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.get('/', (req, res) => {
//   res.json("API is running...");
// });

// app.use('/api/chat', chatRoutes);


// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
