import React, { useMemo, useState } from "react";
import "./Styles/login.css";

type LoginValues = { email: string; password: string };

// ⬇️ add onLoginSuccess prop
export type LoginPageProps = {
  onLogin?: (values: LoginValues) => Promise<void> | void;
  onLoginSuccess?: (user: any) => void;
  initialEmail?: string;
  brand?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onNavigateToRegister?: () => void;
  onNavigateToForgot?: () => void;
};

export default function LoginPage({
  onLogin,
  onLoginSuccess,
  initialEmail,
  brand,
  title = "Welcome back",
  subtitle = "Sign in to continue",
  onNavigateToRegister,
  onNavigateToForgot,
}: LoginPageProps) {
  const [values, setValues] = useState<LoginValues>({
    email: initialEmail ?? "",
    password: "",
  });
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof LoginValues, string>> = {};
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Enter a valid email.";
    if (!values.password) e.password = "Password is required.";
    else if (values.password.length < 8) e.password = "At least 8 characters.";
    return e;
  }, [values]);

  function handleChange<K extends keyof LoginValues>(key: K, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",             // ⬅️ send cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      if (!res.ok) {
        let message = `Login failed (${res.status})`;
        try {
          const data = await res.json();
          if (typeof data?.message === "string") message = data.message;
        } catch {
          const txt = await res.text();
          if (txt) message = txt;
        }
        throw new Error(message);
      }

      const user = await res.json();
      onLoginSuccess?.(user);               // ⬅️ lift user to parent (App)
    } catch (err: any) {
      setServerError(err?.message ?? "Could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lp-root">
      <div className="lp-grid">
        <Card className="lp-card">
          <header className="lp-header">
            {brand ?? <DefaultBrand />}
            <div className="lp-headings">
              <h1 className="lp-title">{title}</h1>
              <p className="lp-subtitle">{subtitle}</p>
            </div>
          </header>

          <form className="lp-form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={touched.email ? errors.email : undefined}
            />

            <TextField
              label="Password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => handleChange("password", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={touched.password ? errors.password : undefined}
            />

            {serverError && <FormAlert role="alert">{serverError}</FormAlert>}

            <div className="lp-actions">
              <Button type="submit" loading={submitting} className="lp-submit">
                Sign in
              </Button>

              <div className="lp-links">
                <button type="button" className="lp-link" onClick={onNavigateToForgot}>
                  Forgot password?
                </button>
                <span className="lp-dot" aria-hidden>·</span>
                <button type="button" className="lp-link" onClick={onNavigateToRegister}>
                  Create account
                </button>
              </div>
            </div>
          </form>
        </Card>

        <AsidePanel />
      </div>
    </div>
  );
}

/* ----------------------------- UI PRIMITIVES ----------------------------- */

type CardProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };
function Card({ className, ...rest }: CardProps) {
  return <div className={`lp-card-base ${className ?? ""}`} {...rest} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  loading?: boolean;
  className?: string;
};
function Button({
  children,
  variant = "solid",
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const cls =
    variant === "outline"
      ? "lp-btn lp-btn--outline"
      : variant === "ghost"
      ? "lp-btn lp-btn--ghost"
      : "lp-btn lp-btn--solid";
  return (
    <button
      className={`${cls} ${className ?? ""}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner aria-label="loading" />}
      <span className="lp-btn-label">{children}</span>
    </button>
  );
}

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label: string;
  error?: string;
};
const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, ...rest }, ref) => {
    const fieldId = id ?? `fld-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const errId = `${fieldId}-error`;
    return (
      <div className={`lp-field ${error ? "lp-field--error" : ""}`}>
        <label htmlFor={fieldId} className="lp-label">
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className="lp-input"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errId : undefined}
          {...rest}
        />
        {error && (
          <p id={errId} className="lp-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";

function FormAlert({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="lp-alert" {...rest}>
      {children}
    </div>
  );
}



function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="lp-spinner"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DefaultBrand() {
  return (
    <div className="lp-brand" aria-label="Brand">
      <span className="lp-brand-icon">◎</span>
      <span className="lp-brand-text">
        Doctor<span className="lp-brand-accent">Connect</span>
      </span>
    </div>
  );
}

function AsidePanel() {
  return (
    <aside className="lp-aside">
      <div className="lp-aside-content">
        <h2>Your health, simplified.</h2>
        <p>Book appointments, manage visits, and review your doctors in one place.</p>
        <ul className="lp-aside-bullets">
          <li>Trusted & verified doctors</li>
          <li>Transparent pricing</li>
          <li>Smart scheduling</li>
        </ul>
      </div>
    </aside>
  );
}
