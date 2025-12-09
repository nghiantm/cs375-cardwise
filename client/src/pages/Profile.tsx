// client/src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth, useAuthFetch } from "../context/AuthContext";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authFetch = useAuthFetch();

  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Fallback in case route isn't wrapped in ProtectedRoute
      navigate("/login");
      return;
    }

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });
    setLoadingInitial(false);
  }, [user, navigate]);

  const handleChange =
    (field: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null);
      setSuccess(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await authFetch(
        `http://localhost:3000/api/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully.");
      // Note: navbar name will update on next reload / login
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err instanceof TypeError) {
        setError("Unable to reach server. Please check your connection.");
      } else {
        setError(err.message || "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-navy/60">Loading profile…</div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-navy/70 mt-1">
          View and update your personal information.
        </p>
      </header>

      {/* Avatar + Summary */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-aqua/20 flex items-center justify-center text-lg font-semibold text-navy">
          {(form.firstName || user?.email || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-navy">
            {form.firstName || form.lastName
              ? `${form.firstName} ${form.lastName}`.trim()
              : user?.email}
          </div>
          <div className="text-sm text-navy/70">{form.email}</div>
        </div>
      </section>

      {/* Alerts */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Profile Form */}
      <section className="bg-white/70 border border-aqua/40 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Account Details</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm text-navy mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={handleChange("firstName")}
                className="rounded-md border border-aqua/40 bg-mint/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua/60"
                placeholder="First name"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-navy mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={handleChange("lastName")}
                className="rounded-md border border-aqua/40 bg-mint/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua/60"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-navy mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="rounded-md border border-aqua/40 bg-mint/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua/60"
              placeholder="you@example.com"
            />
            <p className="text-xs text-navy/60 mt-1">
              This is the email you use to sign in to CardWise.
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
