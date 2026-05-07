const statusClasses = {
  TODO: "bg-amber-500/20 text-amber-200",
  IN_PROGRESS: "bg-sky-500/20 text-sky-200",
  DONE: "bg-brand-500/20 text-brand-100"
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default StatusBadge;
