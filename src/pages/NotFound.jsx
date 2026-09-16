import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
    <span className="text-5xl">🧭</span>
    <h1 className="text-3xl font-bold tracking-tight text-slate-900">404</h1>
    <p className="text-sm text-slate-500">Không tìm thấy trang bạn yêu cầu</p>
    <Link to="/dashboard" className="btn-primary mt-2">
      Về trang chủ
    </Link>
  </div>
);

export default NotFound;
