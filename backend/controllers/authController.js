const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// ================= REGISTER =================

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
    });

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// ================= LOGIN =================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// ================= GET CURRENT USER =================

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('GETME ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// ================= LOGOUT =================

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private

exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ================= SEND TOKEN RESPONSE =================

const sendTokenResponse = (user, statusCode, res) => {
  // Generate JWT token
  const token = generateToken(user._id);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  };

  // Send response
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,

      // IMPORTANT FOR FRONTEND
      accessToken: token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || '',
      },
    });
};