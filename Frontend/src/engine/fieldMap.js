import { FieldRenderer } from '../components/FieldRenderer.jsx';

export const fieldRendererMap = {
  text: FieldRenderer,
  number: FieldRenderer,
  email: FieldRenderer,
  date: FieldRenderer,
  select: FieldRenderer,
  multiselect: FieldRenderer,
  checkbox: FieldRenderer,
  textarea: FieldRenderer,
  badge: FieldRenderer,
  file: FieldRenderer
};

export const getFieldComponent = (type) => fieldRendererMap[type] || FieldRenderer;
