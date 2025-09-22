const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const expressEjsLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
// Make user available in all views
app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('./models/User');
      const user = await User.findById(decoded.id).select('-password');
      res.locals.user = user;
      req.user = user;
    } catch (err) {
      res.locals.user = null;
      req.user = null;
    }
  } else {
    res.locals.user = null;
    req.user = null;
  }
  next();
});

// EJS layout setup
app.set('layout', './layouts/main'); // Default layout
app.use(expressEjsLayouts);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploads folder for team logos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash('success_msg'),
    error: req.flash('error_msg')
  };
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

// Admin routes with sidebar layout
app.use('/admin', (req, res, next) => {
  app.set('layout', './layouts/sidebar-layout');
  next();
}, require('./routes/admin'));

// Team routes with sidebar layout
app.use('/team', (req, res, next) => {
  app.set('layout', './layouts/sidebar-layout');
  next();
}, require('./routes/team'));

app.use('/api', require('./routes/api'));

// Socket.io setup
require('./sockets/auction')(io);

// Error handling
app.use((req, res) => {
  res.status(404).render('errors/404', {
    title: 'Error',
    message: 'Page not found'
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));