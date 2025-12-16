import React, { useMemo, useState } from "react";
//tailwindcss
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
  const [touched, setTouched] = useState<
    Record<keyof RegisterValues, boolean>
  >({
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
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      e.email = "Enter a valid email.";
    if (!values.password) e.password = "Password is required.";
    else if (values.password.length < 8) e.password = "At least 8 characters.";
    if (!values.confirmPassword)
      e.confirmPassword = "Please confirm password.";
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

      if (onRegister) {
        await onRegister({
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          role: values.role,
        });
      }
    } catch (err: any) {
      setServerError(err.message ?? "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        min-h-screen
        bg-[radial-gradient(1200px_600px_at_80%_-10%,#cfe1ff_0%,transparent_60%),radial-gradient(1200px_800px_at_-10%_110%,#d9e7ff_0%,transparent_60%),#f6f9ff]
        flex items-center justify-center
        px-4 py-10
      "
    >
      <div
        className="
          w-full max-w-6xl
          grid grid-cols-1 lg:grid-cols-2
          gap-10
          items-stretch
        "
      >
        {/* LEFT: Register card */}
        <Card className="p-6 sm:p-7 md:p-8 bg-white/95 flex flex-col justify-center">
          <header className="flex items-center gap-4 mb-4">
            {brand ?? <DefaultBrand />}
            <div className="ml-auto text-right space-y-1">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
            </div>
          </header>

          <form
            className="mt-4 grid gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <TextField
              label="Full name"
              placeholder="John Doe"
              value={values.fullName}
              onChange={(e) => handleChange("fullName", e.currentTarget.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, fullName: true }))
              }
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
              onBlur={() =>
                setTouched((t) => ({ ...t, password: true }))
              }
              error={touched.password ? errors.password : undefined}
              autoComplete="new-password"
            />

            <TextField
              label="Confirm password"
              type="password"
              placeholder="********"
              value={values.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.currentTarget.value)
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, confirmPassword: true }))
              }
              error={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
              autoComplete="new-password"
            />

            {/* Role select */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="role"
                className="text-sm text-slate-500"
              >
                Role
              </label>
              <select
                id="role"
                className={`
                  w-full rounded-xl border bg-[#f9fbff] px-3 py-2.5 text-sm
                  outline-none transition
                  border-[#e6eefc]
                  focus:border-[#2d6cdf] focus:ring-4 focus:ring-[rgba(45,108,223,0.35)]
                  hover:bg-[#f3f7ff]
                  ${
                    touched.role && errors.role
                      ? "border-red-500 ring-4 ring-red-100"
                      : ""
                  }
                `}
                value={values.role}
                onChange={(e) =>
                  handleChange("role", e.target.value as Roles)
                }
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
              {touched.role && errors.role && (
                <p className="text-xs text-red-600">{errors.role}</p>
              )}
            </div>

            {serverError && (
              <FormAlert role="alert">{serverError}</FormAlert>
            )}

            <div className="mt-1 grid gap-3">
              <Button
                type="submit"
                loading={submitting}
                className="w-full"
              >
                Create account
              </Button>

              <div className="flex justify-center items-center gap-2 text-sm text-slate-500">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-[#2d6cdf] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* RIGHT: Aside / marketing panel */}
        <AsidePanel />
      </div>
    </div>
  );
}

/* ----------------------------- UI PRIMITIVES ----------------------------- */

type CardProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };
function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-[#e6eefc] rounded-2xl shadow-[0_10px_30px_rgba(27,61,140,0.15)]
        ${className ?? ""}
      `}
      {...rest}
    />
  );
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
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-all duration-150 will-change-transform";
  const solid =
    "text-white border-transparent bg-gradient-to-b from-[#2d6cdf] to-[#1f5ed1] shadow-[0_6px_20px_rgba(45,108,223,0.35)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_4px_16px_rgba(45,108,223,0.25)] disabled:opacity-70 disabled:cursor-not-allowed";
  const outline =
    "bg-white border-[#e6eefc] text-slate-800 hover:border-[#2d6cdf] hover:ring-4 hover:ring-[rgba(45,108,223,0.35)] disabled:opacity-70 disabled:cursor-not-allowed";
  const ghost =
    "bg-transparent border-transparent text-slate-800 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed";

  const variantCls =
    variant === "outline" ? outline : variant === "ghost" ? ghost : solid;

  return (
    <button
      className={`${base} ${variantCls} ${className ?? ""}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner aria-label="loading" />}
      <span className="inline-flex items-center gap-1">{children}</span>
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
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-sm text-slate-500"
        >
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className={`
            w-full rounded-xl border bg-[#f9fbff] px-3 py-2.5 text-sm
            outline-none transition
            border-[#e6eefc]
            hover:bg-[#f3f7ff]
            focus:border-[#2d6cdf] focus:ring-4 focus:ring-[rgba(45,108,223,0.35)]
            ${hasError ? "border-red-500 ring-4 ring-red-100 bg-white" : ""}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? errId : undefined}
          {...rest}
        />
        {hasError && (
          <p id={errId} className="text-xs text-red-600 leading-snug">
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
    <div
      className="
        rounded-xl border border-red-200
        bg-red-50
        px-3 py-2.5 text-sm text-red-700
      "
      {...rest}
    >
      {children}
    </div>
  );
}

function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="w-4 h-4 animate-spin text-current"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
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
    <div className="inline-flex items-center gap-2" aria-label="Brand">
      <span
        className="
          grid place-items-center w-9 h-9 rounded-full
          bg-gradient-to-br from-[#2d6cdf] to-[#1f5ed1]
          text-white text-sm font-extrabold tracking-tight
        "
      >
        ◎
      </span>
      <span className="font-semibold tracking-tight text-slate-900">
        Doctor<span className="text-[#2d6cdf]">Connect</span>
      </span>
    </div>
  );
}

function AsidePanel() {
  return (
    <aside
      className="
        hidden lg:block rounded-2xl border border-[#e6eefc]
        bg-[radial-gradient(900px_600px_at_0%_0%,#e3eeff_0%,transparent_60%),linear-gradient(160deg,#ffffff_0%,#f0f6ff_100%)]
        shadow-[0_10px_30px_rgba(27,61,140,0.15)]
        relative overflow-hidden
      "
    >
      <div className="absolute -top-16 -right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,108,223,0.15),transparent_60%)] blur-md pointer-events-none" />
      <div className="relative p-6 sm:p-8 max-w-xl space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Care starts here.
        </h2>
        <p className="text-sm text-slate-600">
          Create an account to book visits, manage doctors, and more.
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1.5 text-sm text-slate-800">
          <li>Quick onboarding</li>
          <li>Trusted &amp; verified doctors</li>
          <li>Smart scheduling</li>
        </ul>
      </div>
    </aside>
  );
}
