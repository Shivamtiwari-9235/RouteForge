export const requiredRule = (message) => ({ required: message || 'This field is required' });
export const emailRule = { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } };
export const numberRule = { valueAsNumber: true };
export const maxLengthRule = (length) => ({ maxLength: { value: length, message: `Max ${length} characters` } });
