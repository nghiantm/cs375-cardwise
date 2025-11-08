import { Link } from "react-router-dom";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import appLogo from "../assets/appLogo.png";
import picture from "../assets/picture.png";

export default function Signup() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-8 h-[calc(100vh-64px)]">
      <section className="h-full bg-mint/50 rounded-2xl border border-aqua/40 p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <img src={appLogo} alt="CardWise logo" className="w-8 h-8" />
          <span className="font-semibold text-navy">CardWise</span>
        </div>

        <h1 className="text-4xl font-bold text-navy mb-1">Create Your Account</h1>
        <p className="text-navy/70 mb-6">Please enter your details to sign up</p>

        <form className="space-y-4 grow">
          <TextField label="Email Address" type="email" placeholder="you@example.com" />
          <PasswordField label="Password" />
          <PasswordField label="Confirm Password" />

          <button type="submit" className="btn-primary w-full">Sign Up</button>
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
