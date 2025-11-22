import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Alert from "../components/Alert";
import appLogo from "../assets/appLogo.png";
import picture from "../assets/picture.png";

export default function Login() {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  // Check if there's a success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state so message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-8 h-[calc(100vh-64px)]">
      <section className="h-full bg-mint/50 rounded-2xl border border-aqua/40 p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <img src={appLogo} alt="CardWise logo" className="w-8 h-8" />
          <span className="font-semibold text-navy">CardWise</span>
        </div>

        <h1 className="text-4xl font-bold text-navy mb-1">Welcome Back</h1>
        <p className="text-navy/70 mb-6">Please enter your details</p>

        {successMessage && (
          <Alert 
            type="success" 
            message={successMessage} 
            onClose={() => setSuccessMessage("")}
          />
        )}

        <button
          type="button"
          className="w-full rounded-md bg-aqua/40 text-navy py-2 mb-4 hover:bg-aqua/60"
        >
          ⨁ Sign in with Google
        </button>

        <div className="flex items-center gap-3 text-navy/60 text-sm mb-4">
          <div className="h-px bg-navy/20 flex-1" />
          or
          <div className="h-px bg-navy/20 flex-1" />
        </div>

        <form className="space-y-4 grow">
          <TextField label="Email Address" type="email" placeholder="you@example.com" />
          <PasswordField label="Password" />

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don’t have an account yet?{" "}
          <Link to="/signup" className="underline hover:text-aqua">Sign Up</Link>
        </p>
      </section>

      <aside className="h-full rounded-2xl overflow-hidden border border-aqua/40">
        <img src={picture} alt="Financial dashboard illustration" className="w-full h-full object-cover" />
      </aside>
    </main>
  );
}
