import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import FileIcon from '../components/FileIcon';
import {
  fetchDocument,
  updateDocument,
  deleteDocument,
  suggestDocumentMetadata,
} from '../services/documentService';
import {
  formatBytes,
  formatDate,
  buildDownloadUrl,
  canOfficePreview,
  buildOfficePreviewUrl,
} from '../utils/format';
import { useAuth } from '../hooks/useAuth';

const DocumentDetail = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDocument(documentId);
      setDoc(data);
      setDisplayName(data.displayName);
      setCategory(data.category);
      setTags(data.tags.join(', '));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDocument(documentId, { displayName, category, tags });
      setDoc(updated);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const suggestion = await suggestDocumentMetadata(documentId);
      setDisplayName(suggestion.displayName || displayName);
      setCategory(suggestion.category || category);
      setTags(suggestion.tags?.join(', ') || tags);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Không thể lấy gợi ý AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(documentId);
      navigate('/dashboard');
    } catch (err) {
      setConfirmDelete(false);
      setError(err.response?.data?.message || 'Xóa tài liệu thất bại');
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Đang tải...</p>;
  if (error && !doc) return <p className="text-sm text-red-500">{error}</p>;
  if (!doc) return null;

  const canManage = user?.role === 'admin' || doc.owner?._id === user?.id;

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← Quay lại danh sách
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
          {doc.fileType === 'image' ? (
            <img src={doc.url} alt={doc.displayName} className="max-h-[500px] rounded-md object-contain" />
          ) : doc.fileType === 'pdf' ? (
            <iframe title={doc.displayName} src={doc.url} className="h-[500px] w-full rounded-md border" />
          ) : canOfficePreview(doc.fileType) ? (
            <>
              <iframe
                title={doc.displayName}
                src={buildOfficePreviewUrl(doc.url)}
                className="h-[500px] w-full rounded-md border"
              />
              <p className="mt-2 text-xs text-slate-400">
                Xem trước bằng Microsoft Office Online. Nếu không tải được, hãy thử{' '}
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                  mở file trong tab mới
                </a>
                .
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <FileIcon fileType={doc.fileType} className="h-20 w-20 text-4xl" />
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Mở file trong tab mới
              </a>
            </div>
          )}
          <a
            href={buildDownloadUrl(doc)}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            ⬇ Tải xuống ({doc.displayName})
          </a>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          {editing ? (
            <div className="space-y-4">
              {(doc.fileType === 'image' || doc.fileType === 'pdf') && (
                <div>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {aiLoading ? 'Đang phân tích...' : '✨ Gợi ý bằng AI'}
                  </button>
                  {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600">Tên hiển thị</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Danh mục</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Thẻ (phân cách bằng dấu phẩy)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-800 break-words">{doc.displayName}</h2>
              <p className="text-sm text-slate-400">Tên gốc: {doc.originalName}</p>
              <p className="text-sm text-slate-400">Dung lượng: {formatBytes(doc.size)}</p>
              <p className="text-sm text-slate-400">Ngày tải lên: {formatDate(doc.createdAt)}</p>
              {doc.owner?.fullName && (
                <p className="text-sm text-slate-400">Người tải lên: {doc.owner.fullName}</p>
              )}
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {doc.category}
                </span>
              </div>
              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              {canManage ? (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <p className="pt-2 text-xs text-slate-400">
                  Tài liệu này được chia sẻ với bạn ở chế độ chỉ xem.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa tài liệu"
        message="Bạn có chắc muốn xóa tài liệu này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default DocumentDetail;
