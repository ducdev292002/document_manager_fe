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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-800">📊 Hạn mức lưu trữ - {user?.fullName}</h3>
        <p className="mt-1 text-xs text-slate-400">
          Đang dùng:{' '}
          <span className="font-medium text-slate-500">
            {user ? (user.storageUsedBytes / (1024 * 1024)).toFixed(1) : 0} MB
          </span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="field-label">Hạn mức (MB)</label>
            <input
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Để trống = không giới hạn"
              className="input"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotaModal;
