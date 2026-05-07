const StatCard = ({ label, value, accent }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel backdrop-blur">
      <p className={`text-sm font-medium ${accent}`}>{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
    </div>
  );
};

export default StatCard;
