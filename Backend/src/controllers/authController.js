import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

const createToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn });

const sendRefreshCookie = (res, token) => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'Email already registered' } });
    }
    const user = await User.create({ name: name || 'User', email, password });
    const accessToken = createToken({ id: user._id }, config.jwtSecret, '15m');
    const refreshToken = createToken({ id: user._id }, config.jwtRefreshSecret, '7d');
    sendRefreshCookie(res, refreshToken);
    await Notification.create({ userId: user._id, type: 'success', title: 'Welcome', message: 'Your account has been created successfully' });
    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email }, accessToken }, message: 'Registration successful' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to register user' } });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
  }
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }
    const accessToken = createToken({ id: user._id }, config.jwtSecret, '15m');
    const refreshToken = createToken({ id: user._id }, config.jwtRefreshSecret, '7d');
    sendRefreshCookie(res, refreshToken);
    await Notification.create({ userId: user._id, type: 'info', title: 'Signed in', message: 'Welcome back to RouteForge' });
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email }, accessToken }, message: 'Login successful' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Unable to log in' } });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token missing' } });
  }
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }
    const accessToken = createToken({ id: user._id }, config.jwtSecret, '15m');
    res.json({ success: true, data: { accessToken }, message: 'Token refreshed' });
  } catch (error) {
    logger.warn(error);
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token expired' } });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const me = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email } }, message: 'User loaded' });
  } catch (error) {
    logger.warn(error.message);
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
};
