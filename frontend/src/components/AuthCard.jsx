const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/75 p-8 shadow-panel backdrop-blur">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-brand-300">Team Task Manager</p>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

export default AuthCard;
