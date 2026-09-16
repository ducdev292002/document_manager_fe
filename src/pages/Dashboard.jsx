import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import FolderCard from '../components/FolderCard';
import FolderFormModal from '../components/FolderFormModal';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import UploadModal from '../components/UploadModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { fetchDocuments, deleteDocument } from '../services/documentService';
import {
  fetchFolders,
  fetchFolderPath,
  createFolder,
  renameFolder,
  deleteFolder,
} from '../services/folderService';
import { fetchTeam } from '../services/teamService';

const FILE_TYPES = [
  { value: '', label: 'Tất cả loại file' },
  { value: 'image', label: 'Ảnh' },
  { value: 'pdf', label: 'PDF' },
  { value: 'word', label: 'Word' },
  { value: 'excel', label: 'Excel' },
  { value: 'powerpoint', label: 'PowerPoint' },
  { value: 'text', label: 'Văn bản' },
  { value: 'other', label: 'Khác' },
];

const Dashboard = () => {
  const { folderId, teamId } = useParams();
  const navigate = useNavigate();

  const basePath = teamId ? `/team/${teamId}` : '/dashboard';

  const [team, setTeam] = useState(null);
  const [folders, setFolders] = useState([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [fileType, setFileType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [folderModal, setFolderModal] = useState(null); // { mode: 'create' | 'rename', folder? }
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [folderError, setFolderError] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (!teamId) {
      setTeam(null);
      return;
    }
    fetchTeam(teamId)
      .then(setTeam)
      .catch(() => setTeam(null));
  }, [teamId]);

  const loadFolders = useCallback(async () => {
    const data = await fetchFolders(folderId, teamId);
    setFolders(data);
  }, [folderId, teamId]);

  const loadBreadcrumbs = useCallback(async () => {
    if (!folderId) {
      setBreadcrumbPath([]);
      return;
    }
    try {
      const path = await fetchFolderPath(folderId);
      setBreadcrumbPath(path);
    } catch (err) {
      setBreadcrumbPath([]);
    }
  }, [folderId]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDocuments({
        search: debouncedSearch,
        category,
        fileType,
        from,
        to,
        page,
        limit: 12,
        folder: folderId || 'root',
        ...(teamId ? { team: teamId } : {}),
      });
      setDocuments(res.data);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, fileType, from, to, page, folderId, teamId]);

  useEffect(() => {
    loadFolders();
    loadBreadcrumbs();
  }, [loadFolders, loadBreadcrumbs]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, fileType, from, to, folderId, teamId]);

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete._id);
      setDocToDelete(null);
      setDeleteError('');
      loadDocuments();
    } catch (err) {
      setDocToDelete(null);
      setDeleteError(err.response?.data?.message || 'Xóa tài liệu thất bại');
    }
  };

  const handleOpenFolder = (folder) => navigate(`${basePath}/folder/${folder._id}`);

  const handleCreateFolder = async (name) => {
    await createFolder({ name, parent: folderId, team: teamId });
    loadFolders();
  };

  const handleRenameFolder = async (name) => {
    await renameFolder(folderModal.folder._id, name);
    loadFolders();
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      await deleteFolder(folderToDelete._id);
      setFolderToDelete(null);
      setFolderError('');
      loadFolders();
      loadDocuments();
    } catch (err) {
      setFolderToDelete(null);
      setFolderError(err.response?.data?.message || 'Xóa thư mục thất bại');
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) setIsDraggingOver(true);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    setDroppedFiles(files);
    setUploadOpen(true);
  };

  const homeLabel = teamId ? `👥 ${team?.name || 'Nhóm'}` : '🏠 Tài liệu của tôi';
  const currentTitle =
    breadcrumbPath.length > 0
      ? breadcrumbPath[breadcrumbPath.length - 1].name
      : teamId
      ? team?.name || 'Không gian nhóm'
      : 'Tài liệu của tôi';

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      {isDraggingOver && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-indigo-500/10 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-indigo-400 bg-white px-10 py-8 shadow-xl">
            <span className="text-4xl">📥</span>
            <p className="text-base font-semibold text-indigo-700">Thả file để tải lên</p>
            <p className="text-xs text-slate-400">
              {teamId ? `Vào không gian nhóm hiện tại` : 'Vào thư mục hiện tại'}
            </p>
          </div>
        </div>
      )}

      <Breadcrumbs path={breadcrumbPath} basePath={basePath} homeLabel={homeLabel} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{currentTitle}</h2>
        <div className="flex gap-2">
          <button onClick={() => setFolderModal({ mode: 'create' })} className="btn-secondary">
            📁 Thư mục mới
          </button>
          <button onClick={() => setUploadOpen(true)} className="btn-primary">
            ⬆ Tải lên tài liệu
          </button>
        </div>
      </div>

      <div className="card mb-6 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Danh mục"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        />
        <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="input">
          {FILE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
      </div>

      {folderError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{folderError}</p>
      )}
      {deleteError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>
      )}

      {folders.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Thư mục ({folders.length})
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {folders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onOpen={handleOpenFolder}
                onRename={(f) => setFolderModal({ mode: 'rename', folder: f })}
                onDelete={setFolderToDelete}
              />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Đang tải...</p>
      ) : documents.length === 0 && folders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 py-20 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-sm font-medium text-slate-500">Thư mục trống</p>
          <p className="text-xs text-slate-400">Hãy tạo thư mục hoặc tải lên tài liệu đầu tiên của bạn!</p>
        </div>
      ) : documents.length > 0 ? (
        <div>
          {folders.length > 0 && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tài liệu ({pagination.total})
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} onDelete={setDocToDelete} showOwner={!!teamId} />
            ))}
          </div>
        </div>
      ) : null}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />

      <UploadModal
        open={uploadOpen}
        folderId={folderId}
        teamId={teamId}
        initialFiles={droppedFiles}
        onClose={() => {
          setUploadOpen(false);
          setDroppedFiles([]);
        }}
        onUploaded={loadDocuments}
      />

      <FolderFormModal
        open={!!folderModal}
        title={folderModal?.mode === 'rename' ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}
        initialName={folderModal?.mode === 'rename' ? folderModal.folder.name : ''}
        onSubmit={folderModal?.mode === 'rename' ? handleRenameFolder : handleCreateFolder}
        onClose={() => setFolderModal(null)}
      />

      <ConfirmDialog
        open={!!folderToDelete}
        title="Xóa thư mục"
        message={`Xóa thư mục "${folderToDelete?.name}" sẽ xóa toàn bộ thư mục con và tài liệu bên trong. Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDeleteFolder}
        onCancel={() => setFolderToDelete(null)}
      />

      <ConfirmDialog
        open={!!docToDelete}
        title="Xóa tài liệu"
        message={`Bạn có chắc muốn xóa "${docToDelete?.displayName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDeleteDocument}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  );
};

export default Dashboard;
