import { Link } from 'react-router-dom';
import FileIcon from './FileIcon';
import { formatBytes, formatDate } from '../utils/format';

const DocumentCard = ({ doc, onDelete, showOwner = false }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/dashboard/${doc._id}`} className="block">
        <div className="flex h-36 items-center justify-center bg-slate-50">
          {doc.fileType === 'image' ? (
            <img src={doc.url} alt={doc.displayName} className="h-full w-full object-cover" />
          ) : (
            <FileIcon fileType={doc.fileType} className="h-14 w-14 text-2xl" />
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-slate-800" title={doc.displayName}>
            {doc.displayName}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
          </p>
          {showOwner && doc.owner && (
            <p className="mt-1 truncate text-xs text-indigo-500">{doc.owner.fullName}</p>
          )}
          {doc.category && (
            <span className="mt-2 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
              {doc.category}
            </span>
          )}
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={() => onDelete(doc)}
          className="absolute right-2 top-2 hidden h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow group-hover:flex hover:bg-red-50"
          title="Xóa"
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default DocumentCard;
