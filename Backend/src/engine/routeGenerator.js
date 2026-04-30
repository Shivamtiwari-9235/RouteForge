import express from 'express';
import fs from 'fs';
import { param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import configLoader from '../config/loader.js';
import { buildModelsFromConfig } from './schemaGenerator.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const buildResponse = ({ success, data, message, pagination, error }) => {
  if (!success) {
    return { success: false, error };
  }
  const response = { success: true, data: data ?? null, message: message ?? '' };
  if (pagination) response.pagination = pagination;
  return response;
};

const paginationMeta = (total, page, limit) => ({ page, limit, total });

// Multer configuration for file uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (error) {
  logger.error('UPLOADS_DIRECTORY_ERROR', error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Accept common document and image types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed`));
    }
  }
});

const sanitizePayload = (payload) => {
  const clean = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    
    // Skip file objects and FileList objects (they're handled by multer)
    if (value instanceof File) return;
    if (typeof value === 'object' && value?.constructor?.name === 'FileList') return;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value instanceof Date) {
        clean[key] = value;
        return;
      }
      if (value?.name && typeof value.name === 'string') {
        clean[key] = value.name;
        return;
      }
      clean[key] = value;
      return;
    }
    clean[key] = value;
  });
  return clean;
};

export const createDynamicApiRouter = (appConfig, models) => {
  const router = express.Router();
  const endpoints = appConfig?.api?.endpoints || [];

  const findEndpoint = (pathName, method) => endpoints.find((item) => item.path === pathName && item.method === method);

  const resolveModel = (req) => {
    const routePath = `/${req.params.model}`;
    let endpoint = findEndpoint(routePath, req.method);
    if (!endpoint && ['PUT', 'DELETE'].includes(req.method)) {
      endpoint = endpoints.find((item) => item.path === routePath && item.auth === true);
    }
    if (!endpoint) return null;
    return models[endpoint.model] || null;
  };

  const validateEndpoint = (req, res, next) => {
    const model = resolveModel(req);
    if (!model) {
      return res.status(404).json(buildResponse({ success: false, error: { code: 'ENDPOINT_NOT_FOUND', message: 'No API endpoint configured for this path.' } }));
    }
    req.targetModel = model;
    next();
  };

  router.use('/:model', validateEndpoint);

  router.get('/:model', authMiddleware, async (req, res) => {
    const model = req.targetModel;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 12, 50);
    const search = req.query.search ?? '';
    const filter = { userId: req.user.id };

    if (search) {
      filter.$text = { $search: search };
    }

    try {
      const total = await model.countDocuments(filter);
      const records = await model.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      res.json(buildResponse({
        success: true,
        data: records,
        message: 'Records fetched successfully',
        pagination: paginationMeta(total, page, limit)
      }));
    } catch (error) {
      logger.error(error);
      res.status(500).json(buildResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unable to fetch records' } }));
    }
  });

  router.post('/:model', authMiddleware, upload.any(), async (req, res) => {
    const model = req.targetModel;
    try {
      // Build payload from body and files
      const payload = { ...req.body, userId: req.user.id };
      
      // Handle file uploads - store file paths
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          payload[file.fieldname] = `/uploads/${file.filename}`;
        });
      }
      
      const sanitized = sanitizePayload(payload);
      const record = await model.create(sanitized);
      res.status(201).json(buildResponse({ success: true, data: record, message: 'Record created successfully' }));
    } catch (error) {
      logger.error('CREATE_ERROR', error.message, error);
      const fields = Object.keys(error.errors || {});
      const msg = error.message || 'Record creation failed';
      res.status(400).json(buildResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: msg, fields } }));
    }
  });

  router.put('/:model/:id', authMiddleware, upload.any(), async (req, res) => {
    const model = req.targetModel;
    const { id } = req.params;
    try {
      // Build payload from body and files
      const payload = { ...req.body, updatedAt: new Date() };
      
      // Handle file uploads - store file paths
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          payload[file.fieldname] = `/uploads/${file.filename}`;
        });
      }
      
      const sanitized = sanitizePayload(payload);
      const record = await model.findOneAndUpdate({ _id: id, userId: req.user.id }, sanitized, { new: true, runValidators: true });
      if (!record) {
        return res.status(403).json(buildResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Record not found or access denied' } }));
      }
      res.json(buildResponse({ success: true, data: record, message: 'Record updated successfully' }));
    } catch (error) {
      logger.error(error);
      const fields = Object.keys(error.errors || {});
      res.status(400).json(buildResponse({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Record update failed', fields } }));
    }
  });

  router.delete('/:model/:id', authMiddleware, async (req, res) => {
    const model = req.targetModel;
    const { id } = req.params;
    try {
      const deleted = await model.findOneAndDelete({ _id: id, userId: req.user.id });
      if (!deleted) {
        return res.status(403).json(buildResponse({ success: false, error: { code: 'FORBIDDEN', message: 'Record not found or access denied' } }));
      }
      res.json(buildResponse({ success: true, data: deleted, message: 'Record deleted successfully' }));
    } catch (error) {
      logger.error(error);
      res.status(500).json(buildResponse({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unable to delete record' } }));
    }
  });

  return router;
};
