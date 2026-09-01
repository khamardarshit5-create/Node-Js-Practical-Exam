const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 
  };
}

exports.getRegister = (req, res) => {
  res.render('register', {
    title: 'Register',
    error: null,
    success: req.query.success || null,
    formData: {}
  });
};

exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;


    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'All fields are required.',
        success: null,
        formData: { username, email }
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Username must be at least 3 characters long.',
        success: null,
        formData: { username, email }
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Please provide a valid email address.',
        success: null,
        formData: { username, email }
      });
    }

    if (password.length < 6) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Password must be at least 6 characters long.',
        success: null,
        formData: { username, email }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'Password and confirm password do not match.',
        success: null,
        formData: { username, email }
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('register', {
        title: 'Register',
        error: 'An account with that email already exists.',
        success: null,
        formData: { username, email }
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user'
    });

    await user.save();

    return res.redirect('/login?success=Registration successful. Please log in.');
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).render('register', {
      title: 'Register',
      error: 'Something went wrong. Please try again.',
      success: null,
      formData: { username: req.body.username, email: req.body.email }
    });
  }
};

exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login',
    error: null,
    success: req.query.success || null
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        title: 'Login',
        error: 'Email and password are required.',
        success: null
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        success: null
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).render('login', {
        title: 'Login',
        error: 'Invalid email or password.',
        success: null
      });
    }

    const token = signToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.redirect('/tasks');
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).render('login', {
      title: 'Login',
      error: 'Something went wrong. Please try again.',
      success: null
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/login?success=You have been logged out.');
};
