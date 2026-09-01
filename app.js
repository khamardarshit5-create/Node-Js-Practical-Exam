require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { optionalAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(optionalAuth);


app.get('/', (req, res) => {
  res.redirect('/tasks');
});

app.use('/', authRoutes);
app.use('/', taskRoutes);
app.use('/', categoryRoutes);


app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);

  if (err.name === 'CastError') {
    return res.status(400).render('error', {
      title: 'Invalid Request',
      message: 'The requested resource ID is invalid.'
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).render('error', {
      title: 'Validation Error',
      message: messages.join(' ')
    });
  }

  return res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  });
});


mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
