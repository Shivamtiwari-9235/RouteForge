import fs from 'fs/promises';
import path from 'path';
import config from './index.js';
import { logger } from '../utils/logger.js';

const computeLineNumber = (jsonText, pos) => {
  const lines = jsonText.slice(0, pos).split(/\r?\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
};

const parseJson = (text, source) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const positionMatch = /position\s*(\d+)/i.exec(error.message);
    if (positionMatch) {
      const pos = Number(positionMatch[1]);
      const { line, column } = computeLineNumber(text, pos);
      throw new Error(`Malformed JSON in ${source} at ${line}:${column} - ${error.message}`);
    }
    throw new Error(`Malformed JSON in ${source} - ${error.message}`);
  }
};

const loadAppConfig = async () => {
  if (config.configSource === 'remote' && config.configUrl) {
    const response = await fetch(config.configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote config: ${response.statusText}`);
    }
    const raw = await response.text();
    const loaded = parseJson(raw, config.configUrl);
    logger.info('Loaded remote app config');
    return loaded;
  }

  const filePath = path.resolve(process.cwd(), config.configPath);
  const raw = await fs.readFile(filePath, 'utf-8');
  const loaded = parseJson(raw, config.configPath);
  logger.info('Loaded local app config');
  return loaded;
};

export default loadAppConfig;
