import { Link } from 'react-router-dom';
import FileIcon from './FileIcon';
import { formatBytes, formatDate } from '../utils/format';

const DocumentCard = ({ doc, onDelete, onShare, showOwner = false }) => {
  const hasSharedWith = doc.sharedWith?.length > 0;
  return (
    <div className="card-hover group relative flex flex-col overflow-hidden">
      <Link to={`/dashboard/${doc._id}`} className="block">
        <div className="flex h-36 items-center justify-center bg-slate-50">
          {doc.fileType === 'image' ? (
            <img src={doc.url} alt={doc.displayName} className="h-full w-full object-cover" />
          ) : (
            <FileIcon fileType={doc.fileType} className="h-14 w-14 text-2xl" />
          )}
        </div>
        <div className="p-3.5">
          <p className="truncate text-sm font-medium text-slate-800" title={doc.displayName}>
            {doc.displayName}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
          </p>
          {showOwner && doc.owner && (
            <p className="mt-1 truncate text-xs font-medium text-indigo-500">{doc.owner.fullName}</p>
          )}
          {showOwner && (doc.folder?.name || doc.team?.name) && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              📁 {doc.folder?.name || doc.team?.name}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {doc.category && <span className="badge-indigo">{doc.category}</span>}
            {hasSharedWith && <span className="badge-green">🔗 {doc.sharedWith.length}</span>}
          </div>
        </div>
      </Link>
      {(onShare || onDelete) && (
        <div className="absolute right-2 top-2 hidden gap-1.5 group-hover:flex">
          {onShare && (
            <button
              onClick={() => onShare(doc)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-indigo-500 shadow-sm ring-1 ring-slate-200 hover:bg-indigo-50"
              title="Chia sẻ"
            >
              🔗
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(doc)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm ring-1 ring-slate-200 hover:bg-red-50"
              title="Xóa"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
