import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/axios";
import FormInput from "../components/FormInput";
import TaskCard from "../components/TaskCard";

const initialMemberForm = { email: "", role: "MEMBER" };
const initialTaskForm = {
  title: "",
  description: "",
  assignedToId: "",
  dueDate: "",
  status: "TODO"
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const project = useMemo(
    () => projects.find((item) => item.id === Number(projectId)),
    [projects, projectId]
  );

  const isAdmin = project?.currentUserRole === "ADMIN";

  const loadProjectData = async () => {
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        api.get("/projects"),
        api.get(`/tasks/project/${projectId}`)
      ]);
      setProjects(projectsResponse.data);
      setTasks(tasksResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project details");
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleAddMember = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post(`/projects/${projectId}/members`, memberForm);
      setMemberForm(initialMemberForm);
      setSuccess("Member added successfully.");
      loadProjectData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/tasks", { ...taskForm, projectId: Number(projectId) });
      setTaskForm(initialTaskForm);
      setSuccess("Task created successfully.");
      loadProjectData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError("");

    try {
      await api.put(`/tasks/${taskId}`, { status });
      loadProjectData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  if (!project) {
    return <p className="text-sm text-slate-300">{error || "Loading project..."}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">{project.currentUserRole}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">{project.description || "No description yet."}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-4 text-sm text-slate-300">
            <p>Owner: {project.owner.name}</p>
            <p className="mt-1">Members: {project.members.length}</p>
            <p className="mt-1">Tasks: {tasks.length}</p>
          </div>
        </div>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {success ? <p className="text-sm text-brand-300">{success}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[350px,1fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
            <h3 className="text-xl font-semibold text-white">Members</h3>
            <div className="mt-5 space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  <p className="font-medium text-white">{member.user.name}</p>
                  <p className="text-sm text-slate-400">{member.user.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-300">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
              <h3 className="text-xl font-semibold text-white">Add Member</h3>
              <form onSubmit={handleAddMember} className="mt-5 space-y-4">
                <FormInput
                  label="Member Email"
                  type="email"
                  placeholder="member@example.com"
                  value={memberForm.email}
                  onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Role</span>
                  <select
                    value={memberForm.role}
                    onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
                >
                  Add Member
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {isAdmin ? (
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
              <h3 className="text-xl font-semibold text-white">Create Task</h3>
              <form onSubmit={handleCreateTask} className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormInput
                    label="Task Title"
                    placeholder="Design homepage cards"
                    value={taskForm.title}
                    onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  />
                </div>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Description</span>
                  <textarea
                    rows="4"
                    placeholder="Describe the expected deliverable"
                    value={taskForm.description}
                    onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Assign To</span>
                  <select
                    value={taskForm.assignedToId}
                    onChange={(event) => setTaskForm({ ...taskForm, assignedToId: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((member) => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Due Date</span>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Status</span>
                  <select
                    value={taskForm.status}
                    onChange={(event) => setTaskForm({ ...taskForm, status: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </label>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Tasks</h3>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">{tasks.length} items</span>
            </div>

            <div className="space-y-4">
              {tasks.length ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canEditAll={isAdmin}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <p className="text-sm text-slate-300">No tasks available for this project yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailsPage;
