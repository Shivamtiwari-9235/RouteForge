import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { FieldRenderer } from '../components/FieldRenderer.jsx';
import { api } from '../utils/api.js';

export default function DynamicPage() {
  const { pageId } = useParams();
  const { config, translate, setUnreadCount, unreadCount } = useApp();
  const page = useMemo(() => config?.pages?.find((item) => item.id === pageId), [config, pageId]);
  const [items, setItems] = useState([]);
  const [pageMeta, setPageMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [activeItem, setActiveItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const modelPath = page?.id;

  useEffect(() => {
    if (!page) return;
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/${modelPath}`);
      if (response.data.success) {
        setItems(response.data.data);
        setPageMeta(response.data.pagination || pageMeta);
      }
    } catch (error) {
      toast.error('Unable to load records');
    }
  };

  const openCreate = () => {
    setActiveItem(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setActiveItem(item);
    reset(item);
    setModalOpen(true);
  };

  const createRecord = async (values) => {
    try {
      // Ensure user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please log in to continue');
        return;
      }

      // Check if there are any files in the form
      const hasFiles = Object.values(values).some(value => value instanceof FileList || value instanceof File);
      
      let payload = values;
      let headers = {};
      
      if (hasFiles) {
        // Convert to FormData for file uploads
        payload = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value instanceof FileList) {
            if (value.length > 0) {
              payload.append(key, value[0]);
            }
          } else if (value instanceof File) {
            payload.append(key, value);
          } else if (value !== undefined && value !== null) {
            payload.append(key, value);
          }
        });
      }

      const response = await api.post(`/${modelPath}`, payload, { headers });
      if (response.data.success) {
        toast.success(response.data.message || 'Record created successfully!');
        setItems((prev) => [response.data.data, ...prev]);
        setModalOpen(false);
        reset({});
      }
    } catch (error) {
      console.error('Create error:', error.response?.data);
      const message = error.response?.data?.error?.message || 'Failed to create record. Please try again.';
      toast.error(message);
    }
  };

  const updateRecord = async (values) => {
    try {
      // Check if there are any files in the form
      const hasFiles = Object.values(values).some(value => value instanceof FileList || value instanceof File);
      
      let payload = values;
      let headers = {};
      
      if (hasFiles) {
        // Convert to FormData for file uploads
        payload = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value instanceof FileList) {
            if (value.length > 0) {
              payload.append(key, value[0]);
            }
          } else if (value instanceof File) {
            payload.append(key, value);
          } else if (value !== undefined && value !== null && value !== '') {
            payload.append(key, value);
          }
        });
      }

      const response = await api.put(`/${modelPath}/${activeItem._id}`, payload, { headers });
      if (response.data.success) {
        toast.success(response.data.message);
        setItems((prev) => prev.map((item) => (item._id === activeItem._id ? response.data.data : item)));
        setModalOpen(false);
      }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Update failed';
      toast.error(message);
    }
  };

  const deleteRecord = async (record) => {
    if (!confirm('Delete this item?')) return;
    try {
      const response = await api.delete(`/${modelPath}/${record._id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setItems((prev) => prev.filter((item) => item._id !== record._id));
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const onSubmit = (values) => activeItem ? updateRecord(values) : createRecord(values);

  const openImportDialog = () => {
    setCsvPreview(null);
    setImportFile(null);
    setImportOpen(true);
  };

  const handleCsvSelection = (event) => {
    const file = event.target.files[0];
    if (file) setImportFile(file);
  };

  const previewCsv = async () => {
    if (!importFile) return;
    const form = new FormData();
    form.append('file', importFile);
    const response = await api.post('/import/csv?preview=true', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (response.data.success) {
      setCsvPreview(response.data.data);
      toast.success('Preview ready');
    }
  };

  const confirmImport = async () => {
    if (!importFile) return;
    const form = new FormData();
    form.append('file', importFile);
    const response = await api.post('/import/csv?preview=false', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    if (response.data.success) {
      toast.success(response.data.message);
      setImportOpen(false);
      fetchItems();
      setUnreadCount((count) => count + 1);
    }
  };

  if (!page) {
    return <div className="text-muted">{translate('noPages')}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={page.title} subtitle="Manage data for your configured model" actions={(
        <div className="flex gap-3">
          {page.actions.includes('csv_import') && (
            <button 
              onClick={openImportDialog} 
              className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import CSV
            </button>
          )}
          {page.actions.includes('create') && (
            <button 
              onClick={openCreate} 
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-lg hover:from-primary/80 hover:to-indigo-500/80 transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add {page.title.slice(0, -1)}
            </button>
          )}
        </div>
      )} />

      <div className="background-panel p-6 rounded-xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{page.title}</h2>
            <p className="text-muted">Manage and organize your {page.title.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              placeholder={`Search ${page.title.toLowerCase()}...`} 
              className="flex-1 md:flex-none px-4 py-3 rounded-lg border border-border bg-surface text-white placeholder-muted focus:border-primary focus:outline-none transition-colors" 
            />
            <span className="text-sm text-muted bg-surface2 px-3 py-2 rounded-lg">
              {pageMeta.total} {page.title.toLowerCase()}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface2/50">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface">
              <tr>
                {page.columns.map((column) => (
                  <th key={column.field} className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    {column.label || column.field}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={page.columns.length + 1} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                        <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-muted">No {page.title.toLowerCase()} found yet.</div>
                      <button onClick={openCreate} className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors">
                        Create your first {page.title.toLowerCase().slice(0, -1)}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : items.map((item) => (
                <tr key={item._id} className="hover:bg-surface transition-colors">
                  {page.columns.map((column) => (
                    <td key={column.field} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {column.type === 'badge' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item[column.field] === 'high' ? 'bg-red-500/20 text-red-400' :
                          item[column.field] === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          item[column.field] === 'low' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item[column.field]}
                        </span>
                      ) : column.type === 'select' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item[column.field] === 'done' ? 'bg-green-500/20 text-green-400' :
                          item[column.field] === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item[column.field]}
                        </span>
                      ) : (
                        item[column.field]?.toString()
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {page.actions.includes('edit') && (
                      <button 
                        onClick={() => openEdit(item)} 
                        className="inline-flex items-center px-3 py-1.5 border border-border rounded-lg text-sm text-white hover:bg-surface transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {page.actions.includes('delete') && (
                      <button 
                        onClick={() => deleteRecord(item)} 
                        className="inline-flex items-center px-3 py-1.5 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modalOpen || importOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            {modalOpen && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {activeItem ? 'Edit' : 'Create'} {page.title.slice(0, -1)}
                  </h2>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="p-2 hover:bg-surface2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {page.columns.map((field) => (
                      <div key={field.field} className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          {field.label || field.field}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        <FieldRenderer field={field} register={register} errors={errors} />
                        {errors[field.field] && (
                          <p className="text-sm text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors[field.field].message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)} 
                      className="px-6 py-2 border border-border text-white rounded-lg hover:bg-surface2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-lg hover:from-primary/80 hover:to-indigo-500/80 transition-all transform hover:scale-105 shadow-lg"
                    >
                      {activeItem ? 'Update' : 'Create'} {page.title.slice(0, -1)}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {importOpen && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Import CSV Data</h2>
                  <button 
                    onClick={() => setImportOpen(false)}
                    className="p-2 hover:bg-surface2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Select CSV File
                    </label>
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleCsvSelection} 
                      className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-white file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-primary file:text-white file:font-medium hover:file:bg-primary/80 transition-colors" 
                    />
                  </div>

                  {csvPreview && (
                    <div className="bg-surface2 rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                      <p className="text-muted mb-4">Found {csvPreview.rows.length} rows to import</p>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-surface">
                            <tr>
                              {csvPreview.headers.map((header) => (
                                <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {csvPreview.rows.slice(0, 3).map((row, index) => (
                              <tr key={index} className="hover:bg-surface/50">
                                {csvPreview.headers.map((header) => (
                                  <td key={header} className="px-4 py-3 text-sm text-white">
                                    {row.row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {csvPreview.rows.length > 3 && (
                        <p className="text-muted text-sm mt-2">... and {csvPreview.rows.length - 3} more rows</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setImportOpen(false)} 
                      className="px-6 py-2 border border-border text-white rounded-lg hover:bg-surface2 transition-colors"
                    >
                      Cancel
                    </button>
                    {!csvPreview && (
                      <button 
                        type="button" 
                        onClick={previewCsv} 
                        className="px-6 py-2 bg-surface2 text-white rounded-lg hover:bg-surface transition-colors"
                      >
                        Preview
                      </button>
                    )}
                    {csvPreview && (
                      <button 
                        type="button" 
                        onClick={confirmImport} 
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-500/80 hover:to-emerald-500/80 transition-all transform hover:scale-105 shadow-lg"
                      >
                        Import {csvPreview.rows.length} Rows
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
