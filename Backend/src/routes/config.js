import express from 'express';
import loadAppConfig from '../config/loader.js';

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const appConfig = await loadAppConfig();
    res.json({ success: true, data: appConfig, message: 'Configuration loaded' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: error.message } });
  }
});
export default router;
