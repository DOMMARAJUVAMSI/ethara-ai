import StatusBadge from "./StatusBadge";

const TaskCard = ({ task, canEditAll, onStatusChange }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{task.description || "No description provided."}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300">
        <p>Assigned to: {task.assignedTo?.name || "Unassigned"}</p>
        <p>Due date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={task.status}
          onChange={(event) => onStatusChange(task.id, event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {canEditAll ? "Admin access" : "Member access"}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
