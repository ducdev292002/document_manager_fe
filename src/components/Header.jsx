import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatBytes } from '../utils/format';
import ChangePasswordModal from './ChangePasswordModal';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-base shadow-sm shadow-indigo-500/25">
          📁
        </span>
        <h1 className="text-base font-semibold text-slate-800">Quản lý tài liệu cá nhân</h1>
      </div>

      <div className="flex items-center gap-3">
        {user?.role !== 'admin' && (
          <p className="hidden text-xs text-slate-400 sm:block">
            Đã dùng <span className="font-medium text-slate-500">{formatBytes(user?.storageUsedBytes || 0)}</span>
            {user?.storageQuotaBytes ? ` / ${formatBytes(user.storageQuotaBytes)}` : ''}
          </p>
        )}

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-slate-700">{user?.fullName}</p>
              <p className="text-xs leading-tight text-slate-400">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-sm">
              {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                🔑 Đổi mật khẩu
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
};

export default Header;
