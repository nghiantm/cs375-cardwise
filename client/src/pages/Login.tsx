// client/src/pages/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Session is now persisted across tabs via localStorage
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Network error. Please check if the server is running.");
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      // Session is now persisted across tabs via localStorage
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google sign-in failed. Please try again.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h1 className="text-3xl font-semibold mb-2">Log In</h1>
          <p className="text-navy/80 mb-6">
            Enter your email and password to access your CardWise dashboard.
          </p>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 rounded-xl bg-navy text-white py-3 font-medium hover:bg-aqua hover:text-navy transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-3 text-navy/60 text-sm my-4">
            <div className="h-px bg-navy/20 flex-1" />
            or
            <div className="h-px bg-navy/20 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full rounded-xl border-2 border-navy text-navy py-3 font-medium hover:bg-navy hover:text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              "Signing in..."
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.18H2.18C1.43 8.54 1 10.22 1 12s.43 3.46 1.18 4.82l2.85-2.21.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.18l3.66 2.84c.87-2.6 3.3-4.64 6.16-4.64z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p className="mt-4 text-sm text-navy/80">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
