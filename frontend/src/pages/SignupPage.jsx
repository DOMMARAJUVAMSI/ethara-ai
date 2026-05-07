import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AuthCard title="Create your account" subtitle="Set up your team workspace and start assigning work.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="Enter a secure password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-brand-400 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-300">
            Login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
};

export default SignupPage;
