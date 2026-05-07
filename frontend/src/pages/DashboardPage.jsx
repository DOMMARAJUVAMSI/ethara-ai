import { useEffect, useState } from "react";

import api from "../api/axios";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!dashboard) {
    return <p className="text-sm text-slate-300">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Projects" value={dashboard.totalProjects} accent="text-brand-300" />
        <StatCard label="Total Tasks" value={dashboard.totalTasks} accent="text-sky-300" />
        <StatCard label="Tasks In Progress" value={dashboard.tasksByStatus.IN_PROGRESS} accent="text-amber-300" />
        <StatCard label="Overdue Tasks" value={dashboard.overdueTasks.length} accent="text-rose-300" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel">
          <h2 className="text-xl font-semibold text-white">Tasks by Status</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>TODO</span>
              <StatusBadge status="TODO" />
              <span>{dashboard.tasksByStatus.TODO}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>IN PROGRESS</span>
              <StatusBadge status="IN_PROGRESS" />
              <span>{dashboard.tasksByStatus.IN_PROGRESS}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>DONE</span>
              <StatusBadge status="DONE" />
              <span>{dashboard.tasksByStatus.DONE}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-panel lg:col-span-2">
          <h2 className="text-xl font-semibold text-white">Overdue Tasks</h2>
          <div className="mt-6 space-y-3">
            {dashboard.overdueTasks.length ? (
              dashboard.overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-slate-100"
                >
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-slate-300">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">No overdue tasks right now.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
