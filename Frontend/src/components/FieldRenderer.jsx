import { Fragment } from 'react';

const fieldClass = 'w-full px-4 py-3 border border-border rounded-input bg-bg text-white transition-colors duration-200';

export const FieldRenderer = ({ field, register, errors }) => {
  const error = errors?.[field.field]?.message;
  const label = field.label || field.field;
  const props = { ...register(field.field, { required: field.required ? `${label} is required` : false }) };

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return <textarea rows="4" className={fieldClass} {...props} />;
      case 'select':
        return (
          <select className={fieldClass} {...props}>
            <option value="">Select {label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <select multiple className={fieldClass} {...props}>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary" {...props} />
            <span>{label}</span>
          </label>
        );
      case 'date':
        return <input type="date" className={fieldClass} {...props} />;
      case 'number':
        return <input type="number" className={fieldClass} {...props} />;
      case 'email':
        return <input type="email" className={fieldClass} {...props} />;
      case 'file':
        return <input type="file" className={fieldClass} {...props} />;
      case 'badge':
        return (
          <select className={fieldClass} {...props}>
            <option value="">Select {label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return <input type="text" className={fieldClass} {...props} />;
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && <label className="text-sm font-semibold text-white">{label}</label>}
      {renderInput()}
      {field.type === 'file' && <p className="text-xs text-muted">Upload a document that matches your process.</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!['text','number','email','date','select','textarea','checkbox','multiselect','badge','file'].includes(field.type) && (
        <p className="text-xs text-warning">Unknown field type, rendering text input</p>
      )}
    </div>
  );
};
