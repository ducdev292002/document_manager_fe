const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
      >
        Trước
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              p === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-slate-50"
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination;
