import { Link, Outlet } from "react-router-dom";
import icon from "../assets/icon.png"; 

export default function Layout() {
  return (
    <div className="min-h-screen bg-mint text-navy">
      <header className="h-16 border-b border-aqua/30 bg-mint/80 backdrop-blur">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={icon} alt="CardWise icon" className="h-8 w-auto md:h-9" />
            <span className="text-xl md:text-2xl font-semibold">CardWise</span>
          </Link>

          <nav className="flex gap-6 text-base">
          <Link to="/login" className="underline underline-offset-4 hover:text-aqua px-1 py-2">
            Log In
          </Link>
          <Link to="/signup" className="underline underline-offset-4 hover:text-aqua px-1 py-2">
            Sign Up
          </Link>
        </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
