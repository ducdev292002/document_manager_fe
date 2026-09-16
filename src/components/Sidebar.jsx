import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchMyTeams, fetchAllTeams } from '../services/teamService';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

const Sidebar = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const load = user?.role === 'admin' ? fetchAllTeams : fetchMyTeams;
    load()
      .then(setTeams)
      .catch(() => setTeams([]));
  }, [user?.role]);

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4">
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" end className={linkClass}>
          📂 Tài liệu của tôi
        </NavLink>
        <NavLink to="/shared" className={linkClass}>
          🔗 Được chia sẻ với tôi
        </NavLink>

        {teams.length > 0 && (
          <>
            <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {user?.role === 'admin' ? 'Tất cả nhóm' : 'Nhóm của tôi'}
            </p>
            {teams.map((team) => (
              <NavLink key={team._id} to={`/team/${team._id}`} className={linkClass}>
                👥 {team.name}
              </NavLink>
            ))}
          </>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}>
            🛡️ Quản trị hệ thống
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
