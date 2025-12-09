// client/src/components/Navbar.tsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/appLogo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login");
    }
  };

  const displayName =
    user?.firstName || user?.email?.split("@")[0] || "Profile";

  return (
    <nav className="w-full border-b border-aqua/40 bg-mint/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo / Brand */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src={appLogo}
            alt="CardWise logo"
            className="w-8 h-8 rounded-md bg-white shadow-sm"
          />
          <span className="font-semibold text-navy text-sm md:text-base">
            CardWise
          </span>
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/spending" label="Spending" />
          <NavItem to="/my-cards" label="My Cards" />
          <NavItem to="/personal-ranking" label="Personal Ranking" />
          <NavItem to="/global-ranking" label="Global Ranking" />
        </div>

        {/* Right: Auth / Profile */}
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex btn-secondary text-xs md:text-sm"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn-primary text-xs md:text-sm"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-aqua/50 bg-white/80 px-3 py-1.5 text-xs md:text-sm text-navy hover:bg-aqua/10 transition"
              >
                <div className="w-7 h-7 rounded-full bg-aqua/30 flex items-center justify-center text-xs font-semibold text-navy">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[120px] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-navy/60">
                  {profileOpen ? "▴" : "▾"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-aqua/40 bg-white shadow-md text-xs md:text-sm z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-mint/30 rounded-t-xl"
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/my-cards");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-mint/30"
                  >
                    Manage my cards
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-b-xl"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

type NavItemProps = {
  to: string;
  label: string;
};

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-2 py-1 rounded-md transition",
          isActive
            ? "bg-white/80 text-navy font-medium border border-aqua/40"
            : "text-navy/70 hover:text-navy hover:bg-white/60",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
