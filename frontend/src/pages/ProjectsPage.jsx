import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import FormInput from "../components/FormInput";

const initialProjectForm = { name: "", description: "" };

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialProjectForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/projects", form);
      setForm(initialProjectForm);
      setSuccess("Project created successfully.");
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
        <h2 className="text-2xl font-semibold text-white">Create Project</h2>
        <p className="mt-2 text-sm text-slate-300">New projects automatically make you the admin.</p>

        <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
          <FormInput
            label="Project Name"
            placeholder="Launch Plan"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Description</span>
            <textarea
              rows="4"
              placeholder="Describe the project goal"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400"
            />
          </label>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-brand-300">{success}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
          >
            Create Project
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-panel">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <p className="mt-2 text-sm text-slate-300">Open a project to manage members and tasks.</p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">{projects.length} projects</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:border-brand-400/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{project.description || "No description yet."}</p>
                </div>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100">
                  {project.currentUserRole}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                <span>{project.members.length} members</span>
                <span>{project.tasksCount} tasks</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
