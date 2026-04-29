import express from 'express';
import { body, validationResult } from 'express-validator';
import { login, register, refresh, logout, me } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: errors.array() } });
  }
  next();
};

router.post('/register', authRateLimiter, [body('email').isEmail(), body('password').isLength({ min: 6 })], handleValidation, register);
router.post('/login', authRateLimiter, [body('email').isEmail(), body('password').exists()], handleValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', me);

export default router;
