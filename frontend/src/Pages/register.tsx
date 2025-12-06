import React, { useMemo, useState } from "react";
import "./Styles/login.css";

type Roles = "PATIENT" | "DOCTOR" | "ADMIN";

type RegisterValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Roles;
};


export type RegisterPageProps = {
  onRegister?: (values: {
    fullName: string;
    email: string;
    password: string;
    role: Roles;
  }) => Promise<void> | void;
  brand?: React.ReactNode;
  title?: string;
  subtitle?: string;
  defaultRole?: Roles;
  initialEmail?: string;
  onNavigateToLogin?: () => void;
};

export default function RegisterPage({
  onRegister,
  brand,
  title = "Create your account",
  subtitle = "Join DoctorConnect in a minute",
  defaultRole = "PATIENT",
  initialEmail = "",
  onNavigateToLogin,
}: RegisterPageProps) {
  const [values, setValues] = useState<RegisterValues>({
    fullName: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });
  const [touched, setTouched] = useState<Record<keyof RegisterValues, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof RegisterValues, string>> = {};
    if (!values.fullName.trim()) e.fullName = "Full name is required.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Enter a valid email.";
    if (!values.password) e.password = "Password is required.";
    else if (values.password.length < 8) e.password = "At least 8 characters.";
    if (!values.confirmPassword) e.confirmPassword = "Please confirm password.";
    else if (values.password !== values.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    if (!values.role) e.role = "Please select a role.";
    return e;
  }, [values]);

  function handleChange<K extends keyof RegisterValues>(key: K, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(ev: React.FormEvent) {
  ev.preventDefault();
  setServerError(null);
  if (Object.keys(errors).length > 0) return;

  try {
    setSubmitting(true);

    const res = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Registration failed");
    }

    const user = await res.json();
    console.log("Registered:", user);

   
  } catch (err: any) {
    setServerError(err.message ?? "Could not create account.");
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
              label="Full name"
              placeholder="John Doe"
              value={values.fullName}
              onChange={(e) => handleChange("fullName", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              error={touched.fullName ? errors.fullName : undefined}
            />

            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              error={touched.email ? errors.email : undefined}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              placeholder="********"
              value={values.password}
              onChange={(e) => handleChange("password", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={touched.password ? errors.password : undefined}
              autoComplete="new-password"
            />

            <TextField
              label="Confirm password"
              type="password"
              placeholder="********"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.currentTarget.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              autoComplete="new-password"
            />

            {/* Role select (optional for MVP; default PATIENT) */}
            <div className={`lp-field ${touched.role && errors.role ? "lp-field--error" : ""}`}>
              <label className="lp-label" htmlFor="role">Role</label>
              <select
                id="role"
                className="lp-input"
                value={values.role}
                onChange={(e) => handleChange("role", e.currentTarget.value as Roles)}
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
              {touched.role && errors.role && <p className="lp-error">{errors.role}</p>}
            </div>

            {serverError && <FormAlert role="alert">{serverError}</FormAlert>}

            <div className="lp-actions">
              <Button type="submit" loading={submitting} className="lp-submit">
                Create account
              </Button>

              <div className="lp-links">
                <span>Already have an account?</span>
                <button type="button" className="lp-link" onClick={onNavigateToLogin}>
                  Sign in
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
    <button className={`${cls} ${className ?? ""}`} disabled={disabled || loading} {...rest}>
      {loading && <Spinner aria-label="loading" />}
      <span className="lp-btn-label">{children}</span>
    </button>
  );
}

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
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

function FormAlert({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="lp-alert" {...rest}>
      {children}
    </div>
  );
}

function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="lp-spinner" viewBox="0 0 24 24" width="16" height="16" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
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
        <h2>Care starts here.</h2>
        <p>Create an account to book visits, manage doctors, and more.</p>
        <ul className="lp-aside-bullets">
          <li>Quick onboarding</li>
          <li>Trusted & verified doctors</li>
          <li>Smart scheduling</li>
        </ul>
      </div>
    </aside>
  );
}
