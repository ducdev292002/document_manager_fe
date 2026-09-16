import { useEffect, useState, useCallback } from 'react';
import DocumentCard from '../components/DocumentCard';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { fetchSharedDocuments } from '../services/documentService';

const SharedWithMe = () => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchSharedDocuments({ search: debouncedSearch, page, limit: 12 });
      setDocuments(res.data);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-800">Được chia sẻ với tôi</h2>

      <input
        type="text"
        placeholder="Tìm kiếm theo tên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Đang tải...</p>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 py-16 text-center text-sm text-slate-400">
          Chưa có tài liệu nào được chia sẻ với bạn.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {documents.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} showOwner />
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default SharedWithMe;
