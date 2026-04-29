import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const mapFieldType = (field) => {
  switch (field.type) {
    case 'number':
      return { type: Number };
    case 'email':
      return { type: String, lowercase: true, trim: true };
    case 'date':
      return { type: Date };
    case 'select':
    case 'badge':
      return { type: String, enum: field.options || [] };
    case 'multiselect':
      return [{ type: String }];
    case 'checkbox':
      return { type: Boolean, default: false };
    case 'textarea':
    case 'text':
    case 'file':
    default:
      return { type: String, trim: true };
  }
};

const createSchemaDefinition = (page) => {
  const definition = {};
  if (!Array.isArray(page.columns)) {
    return definition;
  }
  page.columns.forEach((field) => {
    if (!field.field) {
      logger.warn(`Skipping field with missing name in ${page.id}`);
      return;
    }
    definition[field.field] = mapFieldType(field);
    if (field.required) {
      definition[field.field].required = true;
    }
    if (field.searchable) {
      definition[field.field].index = true;
    }
  });
  return definition;
};

export const buildModelsFromConfig = (config) => {
  if (!config?.pages) {
    return {};
  }
  const models = {};

  config.pages.forEach((page) => {
    const name = page.model || page.id;
    if (!name) {
      logger.warn('Page missing model or id in config, skipping model generation');
      return;
    }

    const schemaDefinition = createSchemaDefinition(page);
    schemaDefinition.userId = { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true };

    const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
    schema.index({ userId: 1 });
    schema.index({ createdAt: -1 });
    if (page.columns) {
      page.columns.forEach((field) => {
        if (field.searchable) {
          schema.index({ [field.field]: 1 });
        }
      });
    }

    models[name] = mongoose.models[name] || mongoose.model(name, schema);
  });

  return models;
};
