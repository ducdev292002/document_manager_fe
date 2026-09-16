import { useEffect, useRef, useState } from 'react';

const FolderCard = ({ folder, onOpen, onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="card-hover group relative flex flex-col p-4">
      <button onClick={() => onOpen(folder)} className="flex flex-col items-center gap-2 py-1">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-3xl">
          📁
        </span>
        <span className="w-full max-w-[9rem] truncate text-sm font-medium text-slate-700" title={folder.name}>
          {folder.name}
        </span>
      </button>

      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="hidden h-6 w-6 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200 group-hover:flex hover:bg-slate-100"
          title="Tùy chọn"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                onRename(folder);
              }}
              className="block w-full px-3 py-1.5 text-left text-slate-600 hover:bg-slate-50"
            >
              Đổi tên
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete(folder);
              }}
              className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderCard;
