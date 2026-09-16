import { Link } from 'react-router-dom';

const Breadcrumbs = ({ path, basePath = '/dashboard', homeLabel = '🏠 Tài liệu của tôi' }) => (
  <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
    <Link to={basePath} className="font-medium transition-colors hover:text-indigo-600">
      {homeLabel}
    </Link>
    {path.map((folder) => (
      <span key={folder.id} className="flex items-center gap-1.5">
        <span className="text-slate-300">/</span>
        <Link to={`${basePath}/folder/${folder.id}`} className="transition-colors hover:text-indigo-600">
          {folder.name}
        </Link>
      </span>
    ))}
  </nav>
);

export default Breadcrumbs;
