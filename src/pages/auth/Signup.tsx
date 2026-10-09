
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User, Mail, Lock, ArrowRight } from "lucide-react";
import { signup } from "../../api/authApi";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: "",
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        organizationName: formData.organizationName.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccess(result.message);

      // Account is created, but do not auto-login a pending organization.
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (
              err as {
                response?: {
                  data?: { message?: string; error?: string };
                };
              }
            ).response?.data?.message ??
            (
              err as {
                response?: {
                  data?: { error?: string };
                };
              }
            ).response?.data?.error
          : undefined;

      setError(message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-10 md:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <Building2 size={25} />
              </div>
              <span className="text-2xl font-bold">SiteGenius</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              One platform.
              <br />
              Every conversation.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-emerald-50/90">
              Manage WhatsApp conversations and customer communication
              from one centralized workspace.
            </p>
          </div>

          <p className="text-sm text-emerald-50/70">
            Create your workspace and get started.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Get started
            </p>
            <h2 className="mt-2 text-3xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-slate-400">
              Set up your business workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="organizationName" className="mb-2 block text-sm text-slate-300">
                Business name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your company name"
                  maxLength={150}
                  autoComplete="organization"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-slate-300">
                Your full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Full name"
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                Business email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@company.com"
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}