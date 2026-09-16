import { useEffect, useState } from 'react';
import { fetchUsers } from '../services/adminService';
import { useDebounce } from '../hooks/useDebounce';

const TeamFormModal = ({ open, team, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!open) return;
    setName(team?.name || '');
    setDescription(team?.description || '');
    setSelected(new Set((team?.members || []).map((m) => m.id || m._id || m)));
    setError('');
  }, [open, team]);

  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    fetchUsers({ search: debouncedSearch, limit: 100 })
      .then((res) => setUsers(res.data))
      .finally(() => setLoadingUsers(false));
  }, [open, debouncedSearch]);

  if (!open) return null;

  const toggleUser = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Tên nhóm không được để trống');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description, memberIds: Array.from(selected) });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-800">
          {team ? 'Chỉnh sửa nhóm' : 'Tạo nhóm mới'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col gap-3 overflow-hidden">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên nhóm"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tùy chọn)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />

          <p className="text-xs font-medium text-slate-500">Thành viên</p>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex-1 overflow-y-auto rounded-md border border-slate-200">
            {loadingUsers ? (
              <p className="p-4 text-center text-sm text-slate-400">Đang tải...</p>
            ) : users.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-400">Không tìm thấy user nào</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {users.map((u) => (
                  <li key={u.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : `Lưu (${selected.size} thành viên)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamFormModal;
