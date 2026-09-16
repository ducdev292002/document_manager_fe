import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchMyTeams, fetchAllTeams } from '../services/teamService';

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`;

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
    <aside className="w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4">
      <nav className="flex flex-col gap-0.5">
        <NavLink to="/dashboard" end className={linkClass}>
          <span className="text-base">📂</span> Tài liệu của tôi
        </NavLink>
        <NavLink to="/shared" className={linkClass}>
          <span className="text-base">🔗</span> Được chia sẻ với tôi
        </NavLink>

        {teams.length > 0 && (
          <>
            <p className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {user?.role === 'admin' ? 'Tất cả nhóm' : 'Nhóm của tôi'}
            </p>
            {teams.map((team) => (
              <NavLink key={team._id} to={`/team/${team._id}`} className={linkClass}>
                <span className="text-base">👥</span>
                <span className="truncate">{team.name}</span>
              </NavLink>
            ))}
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="my-3 border-t border-slate-100" />
            <NavLink to="/admin" className={linkClass}>
              <span className="text-base">🛡️</span> Quản trị hệ thống
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
