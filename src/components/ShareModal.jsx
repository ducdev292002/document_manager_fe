import { useEffect, useState } from 'react';
import { fetchShareableUsers, shareDocument } from '../services/documentService';
import { useDebounce } from '../hooks/useDebounce';
import ModalPortal from './ModalPortal';

const ShareModal = ({ open, doc, onClose, onShared }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!open || !doc) return;
    setSelected(new Set((doc.sharedWith || []).map((u) => u.id || u._id || u)));
  }, [open, doc]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchShareableUsers({ search: debouncedSearch, limit: 100 })
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [open, debouncedSearch]);

  if (!open || !doc) return null;

  const toggleUser = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await shareDocument(doc._id, Array.from(selected));
      onShared();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Chia sẻ thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-800">🔗 Chia sẻ "{doc.displayName}"</h3>
        <p className="mt-1 text-xs text-slate-400">
          Chọn user được phép xem &amp; tải xuống tài liệu này (chỉ xem, không sửa/xóa được).
        </p>

        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input mt-4"
        />

        <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-slate-200">
          {loading ? (
            <p className="p-4 text-center text-sm text-slate-400">Đang tải...</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-400">Không tìm thấy user nào</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li key={u.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-700">{u.fullName}</span>
                      <span className="block truncate text-xs text-slate-400">{u.email}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : `Lưu (${selected.size} người)`}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ShareModal;
