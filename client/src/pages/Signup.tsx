import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/appLogo.png";
import picture from "../assets/picture.png";

  const isValidEmail = (email: string): boolean => {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await fetch("http://localhost:3000/api/users/register", {
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
          className="btn-secondary w-full"
        >
          ⨁ Sign Up with Google
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
