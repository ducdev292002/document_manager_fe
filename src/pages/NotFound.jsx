import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
    <h1 className="text-3xl font-semibold text-slate-800">404</h1>
    <p className="text-sm text-slate-500">Không tìm thấy trang bạn yêu cầu</p>
    <Link to="/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">
      Về trang chủ
    </Link>
  </div>
);

export default NotFound;
