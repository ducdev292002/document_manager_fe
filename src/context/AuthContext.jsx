import { createContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Some browsers (Incognito especially) silently refuse to store the
  // login cookie - the POST still "succeeds" with a 200, so we can't tell
  // from that response alone. Confirming with a follow-up /auth/me call
  // (which only succeeds if the cookie actually made it into the jar)
  // stops a half-logged-in user from ever reaching the dashboard.
  const assertSessionPersisted = async () => {
    try {
      await authService.getMe();
    } catch (err) {
      setUser(null);
      const cookieErr = new Error(
        'Đăng nhập thành công nhưng trình duyệt đã chặn cookie phiên đăng nhập (thường gặp ở chế độ ẩn danh hoặc khi chặn cookie bên thứ 3). Vui lòng tắt chế độ ẩn danh / cho phép cookie rồi thử lại.'
      );
      throw cookieErr;
    }
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    setUser(data);
    await assertSessionPersisted();
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setUser(data);
    await assertSessionPersisted();
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
