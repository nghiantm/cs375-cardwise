import { NavLink, Link, Outlet } from "react-router-dom";
import icon from "../assets/icon.png"; 

export default function Layout() {
  return (
    <div className="min-h-screen bg-mint text-navy">
      <header className="h-16 border-b border-aqua/30 bg-mint/80 backdrop-blur">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={icon} alt="CardWise icon" className="h-8 w-auto md:h-9" />
            <span className="text-xl md:text-2xl font-semibold">CardWise</span>
          </Link>

          {/* Main Navigation - Left aligned */}
          <nav className="flex gap-6 text-base flex-1">
            <NavLink 
              to="/" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/spending" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              Spending
            </NavLink>
            <NavLink 
              to="/my-cards" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              My Cards
            </NavLink>
            <NavLink 
              to="/my-best-cards" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              Best Cards
            </NavLink>
            <NavLink 
              to="/card-ranking" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              Ranking
            </NavLink>
            <NavLink 
              to="/add-statements" 
              className={({ isActive }) =>
                `underline-offset-4 hover:text-aqua px-1 py-2 ${
                  isActive ? "underline text-navy" : "text-navy/70"
                }`
              }
            >
              Add Statements
            </NavLink>
          </nav>

          {/* Auth links - Right aligned */}
          <div className="flex gap-4 text-base">
            <Link to="/login" className="underline underline-offset-4 hover:text-aqua px-1 py-2">
              Log In
            </Link>
            <Link to="/signup" className="underline underline-offset-4 hover:text-aqua px-1 py-2">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
