import React, { useMemo, useState } from "react";
type LoginValues = { email: string; password: string };

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

  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---------------- VALIDARE -----------------
  const errors = useMemo(() => {
    const e: Partial<Record<keyof LoginValues, string>> = {};

    if (!values.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      e.email = "Enter a valid email.";

    if (!values.password) e.password = "Password is required.";
    else if (values.password.length < 8) e.password = "At least 8 characters.";

    return e;
  }, [values]);

  function handleChange<K extends keyof LoginValues>(key: K, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  // ---------------- SUBMIT -----------------
  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        credentials: "include",
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
      onLoginSuccess?.(user);
      onLogin?.(values);
    } catch (err: any) {
      setServerError(err?.message ?? "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  }

  const emailError = touched.email ? errors.email : undefined;
  const passwordError = touched.password ? errors.password : undefined;

  // ---------------- UI -----------------
  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-[radial-gradient(1200px_600px_at_80%_-10%,#cfe1ff_0%,transparent_60%),radial-gradient(1200px_800px_at_-10%_110%,#d9e7ff_0%,transparent_60%),#f6f9ff]
        text-[#0b1526]
      "
    >
      <div
        className="
          w-full max-w-5xl
          bg-white rounded-[24px]
          border border-[#e6eefc]
          shadow-[0_10px_30px_rgba(27,61,140,0.15)]
          flex flex-col md:flex-row
          overflow-hidden
        "
      >
        {/* LEFT — FORM */}
        <div className="w-full md:w-1/2 p-10 flex flex-col">
          {/* BRAND */}
          <div className="flex items-center mb-6">
            {brand ?? (
              <div className="flex items-center gap-3">
                {/* ---------- ICON PERFECT CENTRAT ---------- */}
                <div
                  className="
                    flex items-center justify-center
                    w-10 h-10
                    rounded-full
                    bg-[linear-gradient(135deg,#2d6cdf,#1f5ed1)]
                    relative
                  "
                >
                  {/* cerc mare alb */}
                  <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[2px] border-white"></div>
                  {/* cerc mic alb */}
                  <div className="absolute left-[16px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-[2px] border-white"></div>
                </div>

                <span className="text-xl font-semibold tracking-[-0.02em]">
                  Doctor<span className="text-[#2d6cdf]">Connect</span>
                </span>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-semibold text-[#0b1526]">{title}</h1>
          <p className="mt-1 text-sm text-[#5a6a85]">{subtitle}</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#5a6a85]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.currentTarget.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                className={`
                  w-full rounded-[12px] border border-[#e6eefc]
                  bg-[#f9fbff] px-[14px] py-[12px] text-sm outline-none transition
                  hover:bg-[#f3f7ff]
                  focus:border-[#2d6cdf] focus:ring-2 focus:ring-[rgba(45,108,223,0.35)]
                  ${
                    emailError
                      ? "border-[#d87874] shadow-[0_0_0_4px_rgba(211,59,55,0.2)]"
                      : ""
                  }
                `}
              />
              {emailError && (
                <p className="text-xs text-[#d33b37]">{emailError}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#5a6a85]">
                Password
              </label>
              <input
                type="password"
                placeholder="********"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) =>
                  handleChange("password", e.currentTarget.value)
                }
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!passwordError}
                className={`
                  w-full rounded-[12px] border border-[#e6eefc]
                  bg-[#f9fbff] px-[14px] py-[12px] text-sm outline-none transition
                  hover:bg-[#f3f7ff]
                  focus:border-[#2d6cdf] focus:ring-2 focus:ring-[rgba(45,108,223,0.35)]
                  ${
                    passwordError
                      ? "border-[#d87874] shadow-[0_0_0_4px_rgba(211,59,55,0.2)]"
                      : ""
                  }
                `}
              />
              {passwordError && (
                <p className="text-xs text-[#d33b37]">{passwordError}</p>
              )}
            </div>

            {/* SERVER ERROR */}
            {serverError && (
              <p className="text-xs text-[#d33b37]">{serverError}</p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="
                mt-3 w-full rounded-[12px]
                bg-[linear-gradient(180deg,#2d6cdf,#1f5ed1)]
                text-white py-2.5 text-sm font-semibold
                border border-transparent
                shadow-[0_6px_20px_rgba(45,108,223,0.35)]
                transition will-change-transform
                hover:-translate-y-[1px]
                active:translate-y-0
                active:shadow-[0_4px_16px_rgba(45,108,223,0.25)]
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-5 flex justify-between text-xs text-[#5a6a85]">
            <button
              onClick={onNavigateToForgot}
              className="hover:text-[#2d6cdf] hover:underline"
            >
              Forgot password?
            </button>
            <button
              onClick={onNavigateToRegister}
              className="hover:text-[#2d6cdf] hover:underline"
            >
              Create account
            </button>
          </div>
        </div>

        {/* RIGHT — INFO PANEL */}
        <div
          className="
            w-full md:w-1/2 relative px-10 py-10 flex flex-col justify-center
            bg-[radial-gradient(900px_600px_at_0%_0%,#e3eeff_0%,transparent_60%),linear-gradient(160deg,#ffffff_0%,#f0f6ff_100%)]
          "
        >
          <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,108,223,0.15),transparent_60%)] blur-[6px]" />

          <div className="relative">
            <h2 className="text-2xl font-semibold text-[#0b1526] mb-3">
              Your health, simplified.
            </h2>

            <p className="text-sm text-[#5a6a85] mb-5">
              Manage your appointments, doctors, and visits — all in one place.
            </p>

            <ul className="space-y-3 text-sm text-[#0b1526]">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#2d6cdf]" />
                Trusted &amp; verified doctors
              </li>

              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1f5ed1]" />
                Transparent pricing
              </li>

              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4aa3ff]" />
                Smart scheduling
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
