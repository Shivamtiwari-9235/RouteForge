export const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(',').map((header) => header.trim()) || [];
  const rows = lines.map((line) => {
    const values = line.split(',').map((value) => {
      const trimmed = value.trim();
      // Remove surrounding quotes if present
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    });
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
  return { headers, rows };
};

export const validateCsvRows = (rows, schemaFields) => {
  const requiredFields = schemaFields.filter((field) => field.required).map((field) => field.field);
  return rows.map((row, index) => {
    const errors = [];
    requiredFields.forEach((key) => {
      if (!row[key] || row[key].toString().trim() === '') {
        errors.push(`Missing required column: ${key}`);
      }
    });
    return { row, rowIndex: index + 1, errors };
  });
};
