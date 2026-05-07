import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const linkClasses = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

const AppShell = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Team Task Manager</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/dashboard" className={linkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={linkClasses}>
              Projects
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;
