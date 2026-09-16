import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatBytes } from '../utils/format';
import ChangePasswordModal from './ChangePasswordModal';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-800">Quản lý tài liệu cá nhân</h1>
      <div className="flex items-center gap-4">
        {user?.role !== 'admin' && (
          <p className="text-xs text-slate-400">
            Đã dùng {formatBytes(user?.storageUsedBytes || 0)}
            {user?.storageQuotaBytes ? ` / ${formatBytes(user.storageQuotaBytes)}` : ''}
          </p>
        )}
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user?.fullName}</p>
          <p className="text-xs text-slate-400">{user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <button
          onClick={() => setChangePasswordOpen(true)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Đổi mật khẩu
        </button>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Đăng xuất
        </button>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
};

export default Header;
