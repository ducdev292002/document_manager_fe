import { useEffect, useRef, useState } from 'react';
import { uploadDocuments } from '../services/documentService';
import { formatBytes } from '../utils/format';
import ModalPortal from './ModalPortal';

const MAX_SIZE = 20 * 1024 * 1024;

const UploadModal = ({ open, onClose, onUploaded, folderId, teamId, initialFiles }) => {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('Chung');
  const [tags, setTags] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && initialFiles?.length) {
      setFiles(initialFiles);
    }
  }, [open, initialFiles]);

  if (!open) return null;

  const addFiles = (incoming) => {
    const tooBig = incoming.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`File "${tooBig.name}" vượt quá 20MB`);
      return;
    }
    setError('');
    setFiles((prev) => [...prev, ...incoming]);
  };

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) setIsDraggingOver(true);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Vui lòng chọn ít nhất một file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await uploadDocuments(files, { category, tags, folder: folderId, team: teamId }, (evt) => {
        setProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      onUploaded();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setCategory('Chung');
    setTags('');
    setProgress(0);
    setError('');
    onClose();
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-800">⬆ Tải lên tài liệu</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="field-label">Chọn file (ảnh, PDF, Word, Excel...)</label>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isDraggingOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              <span className="text-2xl">{isDraggingOver ? '📥' : '⬆️'}</span>
              <p className="text-sm font-medium text-slate-600">
                {isDraggingOver ? 'Thả file vào đây' : 'Kéo-thả file vào đây, hoặc bấm để chọn'}
              </p>
              <p className="text-xs text-slate-400">Tối đa 20MB mỗi file</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate text-slate-600">{f.name}</span>
                    <span className="shrink-0 text-slate-400">{formatBytes(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="shrink-0 text-slate-400 hover:text-red-500"
                      title="Bỏ file này"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="field-label">Danh mục</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
          </div>

          <div>
            <label className="field-label">Thẻ (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="hợp đồng, công việc"
              className="input"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          {uploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              /> 
              
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} disabled={uploading} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? 'Đang tải lên...' : `Tải lên${files.length ? ` (${files.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
};

export default UploadModal;
