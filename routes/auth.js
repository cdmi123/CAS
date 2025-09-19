const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

// Login page
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// Register handle
router.post('/register', async (req, res) => {
  const { username, email, password, role, teamName, owner } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already exists'
      });
    }

    user = new User({
      username,
      email,
      password,
      role
    });

    await user.save();

    if (role === 'team' && teamName && owner) {
      const team = new Team({
        name: teamName,
        owner,
        user: user._id
      });
      await team.save();
    }

    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true });
        res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/team/dashboard');
      }
    );
  } catch (err) {
    console.error(err);
    res.render('auth/register', {
      title: 'Register',
      error: 'Server error'
    });
  }
});

// Login handle
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials'
      });
    }

    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true });
        res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/team/dashboard');
      }
    );
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      title: 'Login',
      error: 'Server error'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;