import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import { logger } from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
    req.user = { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
    next();
  } catch (error) {
    logger.warn('JWT verification failed', error.message);
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token expired or invalid' } });
  }
};
