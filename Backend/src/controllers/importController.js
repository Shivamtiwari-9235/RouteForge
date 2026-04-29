import multer from 'multer';
import { parseCsv, validateCsvRows } from '../utils/csvParser.js';
import configLoader from '../config/loader.js';
import { buildModelsFromConfig } from '../engine/schemaGenerator.js';
import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

const upload = multer({ storage: multer.memoryStorage() });

export const csvUploadMiddleware = upload.single('file');

export const handleCsvImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'CSV file is required' } });
    }
    const raw = req.file.buffer.toString('utf8');
    const { headers, rows } = parseCsv(raw);
    const appConfig = await configLoader();
    const models = buildModelsFromConfig(appConfig);
    const endpoint = appConfig.api.endpoints.find((item) => item.path === '/tasks');
    if (!endpoint) {
      return res.status(404).json({ success: false, error: { code: 'NO_MODEL', message: 'Configured model not found' } });
    }
    const page = appConfig.pages.find((pageItem) => pageItem.model === endpoint.model);
    if (!page) {
      return res.status(404).json({ success: false, error: { code: 'NO_SCHEMA', message: 'Schema definition missing for CSV model' } });
    }

    const previewOnly = req.query.preview !== 'false';
    const validated = validateCsvRows(rows, page.columns || []);
    const extraHeaders = headers.filter((header) => !page.columns.some((field) => field.field === header));
    const warnings = [];
    if (extraHeaders.length) {
      warnings.push(`Extra columns ignored: ${extraHeaders.join(', ')}`);
    }

    if (previewOnly) {
      return res.json({ success: true, data: { headers, rows: validated, warnings }, message: 'CSV preview ready' });
    }

    const errors = validated.filter((item) => item.errors.length > 0);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { code: 'CSV_VALIDATION', message: 'CSV contains invalid rows', fields: errors } });
    }

    const model = models[endpoint.model];
    const insertRows = rows.map((row) => {
      const payload = { userId: req.user.id };
      page.columns.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(row, field.field)) {
          const value = row[field.field];
          payload[field.field] = field.type === 'number' ? Number(value) : value;
        }
      });
      return payload;
    });

    const inserted = await model.insertMany(insertRows);
    await Notification.create({ userId: req.user.id, type: 'success', title: 'CSV Import Complete', message: `${inserted.length} records imported from CSV` });
    res.json({ success: true, data: inserted, message: 'CSV import completed successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'CSV import failed' } });
  }
};
