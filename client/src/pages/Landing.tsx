import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import icon from "../assets/icon.png";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-10">

      <div className="flex flex-row items-center gap-6 md:gap-8">
        <img
          src={icon}
          alt="CardWise icon"
          className="h-32 md:h-40 w-auto"
        />
        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-none">
          CardWise
        </h1>
      </div>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition text-lg"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 rounded-lg border-2 border-navy text-navy hover:bg-navy hover:text-white transition text-lg"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
