 import { useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);

      await login({
        email: email.trim(),
        password,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 403) {
        setError("You do not have permission to access this account.");
      } else if (status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to login. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
        <span>Loading SiteGenius...</span>
      </div>
    );
  }

  return (
    <div className="login-page">

      {/* =========================================
          BRAND PANEL
         ========================================= */}

      <section className="login-brand-panel">

        <div className="login-brand-glow login-brand-glow-one" />
        <div className="login-brand-glow login-brand-glow-two" />

        <div className="login-brand-content">

          {/* Logo */}

          <div className="login-logo">

            <div className="login-logo-mark">
              S
            </div>

            <div>
              <div className="login-logo-name">
                SiteGenius
              </div>

              <div className="login-logo-subtitle">
                WhatsApp Business Platform
              </div>
            </div>

          </div>


          {/* Hero */}

          <div className="login-hero">

            <div className="login-pill">
              WhatsApp made simple
            </div>

            <h1>
              One workspace.
              <br />

              <span>
                Every conversation.
              </span>
            </h1>

            <p>
              Manage conversations, contacts, products and
              your WhatsApp business from one powerful workspace.
            </p>

          </div>


          {/* Bottom */}

          <div className="login-brand-footer">

            <span>Secure</span>
            <i />
            <span>Multi-tenant</span>
            <i />
            <span>Built for teams</span>

          </div>

        </div>

      </section>


      {/* =========================================
          LOGIN PANEL
         ========================================= */}

      <section className="login-form-panel">

        <div className="login-form-container">

          {/* Mobile logo */}

          <div className="login-mobile-logo">

            <div className="login-logo-mark">
              S
            </div>

            <div>
              <div className="login-logo-name">
                SiteGenius
              </div>

              <div className="login-logo-subtitle">
                WhatsApp Business Platform
              </div>
            </div>

          </div>


          {/* Heading */}

          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to your workspace.
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* Form */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <Mail
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={isSubmitting}
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">

                <LockKeyhole
                  size={18}
                  className="login-input-icon"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <span className="login-button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight
                    size={17}
                  />
                </>
              )}

            </button>

          </form>


          {/* Footer */}

          <p className="login-terms">
            By continuing, you agree to use SiteGenius
            responsibly for your business communication.
          </p>

        </div>

      </section>

    </div>
  );
}