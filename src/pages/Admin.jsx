import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import FileIcon from '../components/FileIcon';
import Pagination from '../components/Pagination';
import ShareModal from '../components/ShareModal';
import TeamFormModal from '../components/TeamFormModal';
import QuotaModal from '../components/QuotaModal';
import { useDebounce } from '../hooks/useDebounce';
import {
  fetchUsers,
  updateUser,
  deleteUser,
  fetchAllDocuments,
  deleteAnyDocument,
  fetchStats,
  fetchCloudinaryUsage,
  fetchActivityLogs,
} from '../services/adminService';
import { fetchAllTeams, createTeam, updateTeam, deleteTeam } from '../services/teamService';
import { formatBytes, formatDate } from '../utils/format';

const TABS = [
  { key: 'users', label: 'Người dùng' },
  { key: 'documents', label: 'Tài liệu' },
  { key: 'teams', label: 'Nhóm' },
  { key: 'logs', label: 'Nhật ký hoạt động' },
];

const ACTION_LABELS = {
  login: 'Đăng nhập',
  upload_document: 'Tải lên tài liệu',
  view_document: 'Xem tài liệu',
  update_document: 'Sửa tài liệu',
  delete_document: 'Xóa tài liệu',
  share_document: 'Chia sẻ tài liệu',
  create_folder: 'Tạo thư mục',
  rename_folder: 'Đổi tên thư mục',
  delete_folder: 'Xóa thư mục',
  create_team: 'Tạo nhóm',
  update_team: 'Sửa nhóm',
  delete_team: 'Xóa nhóm',
  lock_user: 'Khóa user',
  unlock_user: 'Mở khóa user',
  delete_user: 'Xóa user',
};

const QuotaBar = ({ usedPercent }) => (
  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
    <div
      className={`h-full rounded-full ${usedPercent >= 90 ? 'bg-red-500' : usedPercent >= 70 ? 'bg-amber-500' : 'bg-indigo-600'}`}
      style={{ width: `${Math.min(usedPercent, 100)}%` }}
    />
  </div>
);

const StatCard = ({ icon, label, children }) => (
  <div className="card p-5">
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
    <div className="mt-2">{children}</div>
  </div>
);

const StatsBar = ({ stats, cloudUsage }) => {
  const cloudStorage = cloudUsage?.storage;
  const cloudCredits = cloudUsage?.credits;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon="👤" label="Tổng số người dùng">
        <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers ?? '-'}</p>
      </StatCard>
      <StatCard icon="📄" label="Tổng số tài liệu">
        <p className="text-2xl font-bold text-slate-900">{stats?.totalDocuments ?? '-'}</p>
      </StatCard>
      <StatCard icon="💾" label="Dung lượng tài liệu (DB)">
        <p className="text-2xl font-bold text-slate-900">
          {stats ? formatBytes(stats.totalStorageBytes) : '-'}
        </p>
      </StatCard>
      <StatCard icon="☁️" label="Hạn mức Cloudinary">
        {cloudStorage && cloudStorage.limitBytes > 0 ? (
          <>
            <p className="text-lg font-bold text-slate-900">
              {formatBytes(cloudStorage.usedBytes)}{' '}
              <span className="text-sm font-normal text-slate-400">
                / {formatBytes(cloudStorage.limitBytes)}
              </span>
            </p>
            <QuotaBar usedPercent={cloudStorage.usedPercent} />
          </>
        ) : cloudStorage ? (
          <p className="text-lg font-bold text-slate-900">
            {formatBytes(cloudStorage.usedBytes)}{' '}
            <span className="text-sm font-normal text-slate-400">đã dùng (không giới hạn)</span>
          </p>
        ) : cloudCredits ? (
          <>
            <p className="text-lg font-bold text-slate-900">
              {cloudCredits.used.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-400">/ {cloudCredits.limit} credits</span>
            </p>
            <QuotaBar usedPercent={cloudCredits.usedPercent} />
          </>
        ) : (
          <p className="text-sm text-slate-400">Không có dữ liệu</p>
        )}
      </StatCard>
    </div>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToQuota, setUserToQuota] = useState(null);
  const [actionError, setActionError] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers({ search: debouncedSearch, page, limit: 10 });
      setUsers(res.data);
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

  const toggleLock = async (user) => {
    try {
      await updateUser(user.id, { isLocked: !user.isLocked });
      setActionError('');
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Cập nhật người dùng thất bại');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      setActionError('');
      load();
    } catch (err) {
      setUserToDelete(null);
      setActionError(err.response?.data?.message || 'Xóa người dùng thất bại');
    }
  };

  const handleQuotaSubmit = async (storageQuotaMB) => {
    await updateUser(userToQuota.id, { storageQuotaMB });
    load();
  };

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Tìm theo tên hoặc email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input mb-4 max-w-sm"
      />

      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Dung lượng</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={u.isLocked ? 'badge-red' : 'badge-green'}>
                      {u.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatBytes(u.storageUsedBytes)}
                    <span className="text-slate-300">
                      {' '}
                      / {u.storageQuotaBytes ? formatBytes(u.storageQuotaBytes) : 'không giới hạn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setUserToQuota(u)} className="btn-secondary btn-sm">
                        Hạn mức
                      </button>
                      <button onClick={() => toggleLock(u)} className="btn-secondary btn-sm">
                        {u.isLocked ? 'Mở khóa' : 'Khóa'}
                      </button>
                      <button onClick={() => setUserToDelete(u)} className="btn-danger btn-sm">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!userToDelete}
        title="Xóa người dùng"
        message={`Xóa "${userToDelete?.fullName}" sẽ xóa toàn bộ tài liệu của họ. Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />

      <QuotaModal
        open={!!userToQuota}
        user={userToQuota}
        onClose={() => setUserToQuota(null)}
        onSubmit={handleQuotaSubmit}
      />
    </div>
  );
};

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [docToDelete, setDocToDelete] = useState(null);
  const [docToShare, setDocToShare] = useState(null);
  const [actionError, setActionError] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllDocuments({ search: debouncedSearch, page, limit: 10 });
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

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteAnyDocument(docToDelete._id);
      setDocToDelete(null);
      setActionError('');
      load();
    } catch (err) {
      setDocToDelete(null);
      setActionError(err.response?.data?.message || 'Xóa tài liệu thất bại');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Tìm theo tên tài liệu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input mb-4 max-w-sm"
      />

      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tài liệu</th>
              <th className="px-4 py-3">Chủ sở hữu</th>
              <th className="px-4 py-3">Chia sẻ</th>
              <th className="px-4 py-3">Dung lượng</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Không có tài liệu nào
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileIcon fileType={doc.fileType} className="h-8 w-8" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-slate-700 hover:text-indigo-600 hover:underline"
                      >
                        {doc.displayName}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{doc.owner?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {doc.sharedWith?.length > 0 ? (
                      <span className="badge-indigo">{doc.sharedWith.length} người</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatBytes(doc.size)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(doc.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setDocToShare(doc)} className="btn-secondary btn-sm">
                        Chia sẻ
                      </button>
                      <button onClick={() => setDocToDelete(doc)} className="btn-danger btn-sm">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!docToDelete}
        title="Xóa tài liệu"
        message={`Bạn có chắc muốn xóa "${docToDelete?.displayName}"?`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDocToDelete(null)}
      />

      <ShareModal
        open={!!docToShare}
        doc={docToShare}
        onClose={() => setDocToShare(null)}
        onShared={load}
      />
    </div>
  );
};

const TeamsTab = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // { team? } - team undefined = create
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllTeams();
      setTeams(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (payload) => {
    if (formModal?.team) {
      await updateTeam(formModal.team._id, payload);
    } else {
      await createTeam(payload);
    }
    load();
  };

  const handleDelete = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete._id);
      setTeamToDelete(null);
      setActionError('');
      load();
    } catch (err) {
      setTeamToDelete(null);
      setActionError(err.response?.data?.message || 'Xóa nhóm thất bại');
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setFormModal({})} className="btn-primary">
          👥 Nhóm mới
        </button>
      </div>

      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{actionError}</p>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tên nhóm</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Thành viên</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có nhóm nào
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team._id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-700">{team.name}</td>
                  <td className="px-4 py-3 text-slate-500">{team.description || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <span className="badge-indigo">{team.members.length} người</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link to={`/team/${team._id}`} className="btn-secondary btn-sm">
                        Mở
                      </Link>
                      <button onClick={() => setFormModal({ team })} className="btn-secondary btn-sm">
                        Sửa
                      </button>
                      <button onClick={() => setTeamToDelete(team)} className="btn-danger btn-sm">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TeamFormModal
        open={!!formModal}
        team={formModal?.team}
        onClose={() => setFormModal(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!teamToDelete}
        title="Xóa nhóm"
        message={`Xóa nhóm "${teamToDelete?.name}" sẽ xóa toàn bộ thư mục và tài liệu chung của nhóm. Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setTeamToDelete(null)}
      />
    </div>
  );
};

const ActivityLogTab = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchActivityLogs({ action: action || undefined, page, limit: 20 });
      setLogs(res.data);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  }, [action, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [action]);

  return (
    <div>
      <select value={action} onChange={(e) => setAction(e.target.value)} className="input mb-4 max-w-xs">
        <option value="">Tất cả hành động</option>
        {Object.entries(ACTION_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Hành động</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có hoạt động nào
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-700">{log.user?.fullName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="badge-slate">{ACTION_LABELS[log.action] || log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{log.targetName || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
};

const Admin = () => {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [cloudUsage, setCloudUsage] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
    fetchCloudinaryUsage().then(setCloudUsage).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">🛡️ Quản trị hệ thống</h2>

      <StatsBar stats={stats} cloudUsage={cloudUsage} />

      <div className="mb-5 inline-flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'documents' && <DocumentsTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'logs' && <ActivityLogTab />}
    </div>
  );
};

export default Admin;
