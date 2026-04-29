import express from 'express';
import authRoutes from './auth.js';
import configRoutes from './config.js';
import notificationsRoutes from './notifications.js';
import importRoutes from './import.js';
import { createDynamicApiRouter } from '../engine/routeGenerator.js';
import loadAppConfig from '../config/loader.js';
import { buildModelsFromConfig } from '../engine/schemaGenerator.js';

const router = express.Router();

const initDynamicRoutes = async () => {
  const appConfig = await loadAppConfig();
  const models = buildModelsFromConfig(appConfig);
  return createDynamicApiRouter(appConfig, models);
};

router.use('/auth', authRoutes);
router.use('/config', configRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/import', importRoutes);

router.use(async (req, res, next) => {
  const excludedPrefixes = ['/auth', '/config', '/notifications', '/import'];
  if (!excludedPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    const dynamicRouter = await initDynamicRoutes();
    return dynamicRouter(req, res, next);
  }
  next();
});

export default router;
