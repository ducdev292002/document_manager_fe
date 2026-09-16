import { useEffect, useState } from 'react';

const QuotaModal = ({ open, user, onClose, onSubmit }) => {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(user?.storageQuotaBytes ? String(Math.round(user.storageQuotaBytes / (1024 * 1024))) : '');
      setError('');
    }
  }, [open, user]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (value !== '' && (isNaN(Number(value)) || Number(value) <= 0)) {
      setError('Hạn mức phải là một số dương (MB)');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit(value === '' ? null : Number(value));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-800">
          Hạn mức lưu trữ - {user?.fullName}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Đang dùng: {user ? (user.storageUsedBytes / (1024 * 1024)).toFixed(1) : 0} MB
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Hạn mức (MB)</label>
            <input
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Để trống = không giới hạn"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
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
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotaModal;
