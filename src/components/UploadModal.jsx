import { useState } from 'react';
import { uploadDocuments } from '../services/documentService';

const MAX_SIZE = 20 * 1024 * 1024;

const UploadModal = ({ open, onClose, onUploaded, folderId, teamId }) => {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('Chung');
  const [tags, setTags] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const tooBig = selected.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`File "${tooBig.name}" vượt quá 20MB`);
      return;
    }
    setError('');
    setFiles(selected);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-800">Tải lên tài liệu</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Chọn file (ảnh, PDF, Word, Excel...)</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {files.length > 0 && (
              <p className="mt-1 text-xs text-slate-400">{files.length} file đã chọn</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Danh mục</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Thẻ (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="hợp đồng, công việc"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {uploading && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
