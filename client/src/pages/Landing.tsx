import { Link } from "react-router-dom";
import icon from "../assets/icon.png";

export default function Landing() {
  return (
    <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-10">

      {/* Logo + Title */}
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

      {/* TEMPORARY: Dashboard Navigation */}
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-lg bg-navy text-white hover:bg-aqua hover:text-navy transition text-lg"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
