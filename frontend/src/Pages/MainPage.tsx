import DoctorsPage from "./DoctorsPage";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: string;
  authenticated?: boolean;
};

export default function MainPage({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div className="grid gap-4 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="m-0 text-xl font-semibold">
          Welcome, {user.fullName}
        </h2>

        <div className="ml-auto">
          <button
            onClick={onLogout}
            className="rounded-xl border border-blue-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-blue-50 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* User info */}
      <p className="mt-0 text-sm text-gray-600">
        Email: {user.email} — Role: {user.role}
      </p>

      {/* Doctors catalog */}
      <DoctorsPage />
    </div>
  );
}
