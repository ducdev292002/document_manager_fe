import { useEffect, useState, useCallback, useMemo } from 'react';
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
      const res = await fetchSharedDocuments({ search: debouncedSearch, page, limit: 24 });
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

  // Group by the folder/team the document lives in on the sharer's side -
  // shared docs have no folder access of their own, so this is display-only.
  const groups = useMemo(() => {
    const map = new Map();
    for (const doc of documents) {
      const key = doc.folder?._id || doc.team?._id || 'root';
      const label = doc.folder?.name || (doc.team?.name ? `👥 ${doc.team.name}` : '📄 Không thuộc thư mục');
      if (!map.has(key)) map.set(key, { label, docs: [] });
      map.get(key).docs.push(doc);
    }
    return Array.from(map.values());
  }, [documents]);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">🔗 Được chia sẻ với tôi</h2>

      <input
        type="text"
        placeholder="🔍 Tìm kiếm theo tên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input mb-6 max-w-sm"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Đang tải...</p>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 py-20 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-sm text-slate-400">Chưa có tài liệu nào được chia sẻ với bạn.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.label.startsWith('👥') || group.label.startsWith('📄') ? '' : '📁'} {group.label} ·{' '}
                {group.docs.length} tài liệu
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {group.docs.map((doc) => (
                  <DocumentCard key={doc._id} doc={doc} showOwner />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default SharedWithMe;
