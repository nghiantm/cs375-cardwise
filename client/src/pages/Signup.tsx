import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/appLogo.png";
import picture from "../assets/picture.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const isValidEmail = (email: string): boolean => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

export default function Signup() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();  // Stop page reload
    setError("");        // Clear previous errors

        // Validation: Check email format
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validation: Check required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    // Validation: Check password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }


    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);  // Show loading state

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - auto-login and redirect to onboarding
      await login(formData.email, formData.password);
      navigate("/onboarding");

    } catch (err: any) {
      // Check if it's a network error (fetch failed)
      if (err.message === "Failed to fetch" || err instanceof TypeError) {
        setError("Unable to reach server. Please check your connection and try again.");
      } else {
        // Server error or validation error
        setError(err.message || "An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      // Session is now persisted across tabs via localStorage
      // Redirect to onboarding for new users, or dashboard if returning user
      navigate("/onboarding");
    } catch (err) {
      console.error("Google signup error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google sign-up failed. Please try again.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-8 h-[calc(100vh-64px)]">
      <section className="h-full bg-mint/50 rounded-2xl border border-aqua/40 p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <img src={appLogo} alt="CardWise logo" className="w-8 h-8" />
          <span className="font-semibold text-navy">CardWise</span>
        </div>

        <h1 className="text-4xl font-bold text-navy mb-1">Create Your Account</h1>
        <p className="text-navy/70 mb-6">Please enter your details to sign up</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4 grow" onSubmit={handleSubmit}>
          {/* Notice: Your TextField already accepts value and onChange! */}
          <TextField 
            label="Email Address" 
            type="email" 
            placeholder="you@example.com"
            value={formData.email}              // ✅ Works with your component
            onChange={handleChange("email")}    // ✅ Works with your component
            required
          />
          <TextField 
            label="First Name"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            required
          />
          
          <TextField 
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            required
          />
          
          <PasswordField 
            label="Password"
            value={formData.password}
            onChange={handleChange("password")}
            required
          />
          
          <PasswordField 
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
          />

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-navy/60 text-sm my-4">
          <div className="h-px bg-navy/20 flex-1" />
          or
          <div className="h-px bg-navy/20 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {googleLoading ? (
            "Signing up..."
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
              Sign Up with Google
            </>
          )}
        </button>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline hover:text-aqua">Log In</Link>
        </p>
      </section>

      <aside className="h-full rounded-2xl overflow-hidden border border-aqua/40">
        <img src={picture} alt="Financial dashboard illustration" className="w-full h-full object-cover" />
      </aside>
    </main>
  );
}
