export const supportedFieldTypes = ['text', 'number', 'email', 'date', 'select', 'multiselect', 'checkbox', 'textarea', 'badge', 'file'];

export const getPageConfig = (config, pageId) => {
  return config?.pages?.find((page) => page.id === pageId) || null;
};

export const buildFormDefaults = (page) => {
  return (page?.columns || []).reduce((acc, field) => {
    acc[field.field] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {});
};

export const getFieldType = (field) => {
  return supportedFieldTypes.includes(field.type) ? field.type : 'text';
};
