 import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({
  title = "Dashboard",
  subtitle,
  onMenuClick,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const userInitial =
    user?.name?.charAt(0).toUpperCase() || "U";

  /* =========================================
      CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
     ========================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================
      LOGOUT
     ========================================= */

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-[var(--header-height)] w-full items-center justify-between border-b border-[var(--color-border-light)] bg-[var(--color-surface)] px-4 sm:px-6 lg:px-7">

      {/* =========================================
          LEFT
         ========================================= */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>


        {/* Page title */}

        <div className="min-w-0">

          <h1 className="truncate text-base font-semibold tracking-[-0.2px] text-[var(--color-text)] sm:text-lg">
            {title}
          </h1>

          {subtitle && (
            <p className="hidden truncate text-xs text-[var(--color-text-muted)] sm:block">
              {subtitle}
            </p>
          )}

        </div>

      </div>


      {/* =========================================
          RIGHT
         ========================================= */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

        {/* Search */}

        <div className="relative hidden md:block">

          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />

          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-xs text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-soft)] lg:w-52"
          />

        </div>


        {/* Mobile search */}

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] md:hidden"
          aria-label="Search"
        >
          <Search size={19} />
        </button>


        {/* Notifications */}

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="absolute right-[7px] top-[6px] h-1.5 w-1.5 rounded-full bg-[var(--color-danger)] ring-2 ring-[var(--color-surface)]" />
        </button>


        {/* Divider */}

        <div className="mx-1 hidden h-7 w-px bg-[var(--color-border-light)] sm:block" />


        {/* =========================================
            USER PROFILE
           ========================================= */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() =>
              setProfileOpen((previous) => !previous)
            }
            className="flex items-center gap-2 rounded-lg p-1 transition hover:bg-[var(--color-surface-muted)]"
            aria-label="Open user menu"
            aria-expanded={profileOpen}
          >

            {/* Avatar */}

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
              {userInitial}
            </div>


            {/* User information */}

            <div className="hidden min-w-0 text-left lg:block">

              <div className="max-w-28 truncate text-xs font-semibold text-[var(--color-text)]">
                {user?.name || "User"}
              </div>

              <div className="text-[10px] text-[var(--color-text-muted)]">
                {user?.role || "AGENT"}
              </div>

            </div>


            {/* Arrow */}

            <ChevronDown
              size={15}
              className={`hidden text-[var(--color-text-muted)] transition-transform lg:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />

          </button>


          {/* =========================================
              PROFILE DROPDOWN
             ========================================= */}

          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-lg">

              {/* User info */}

              <div className="border-b border-[var(--color-border-light)] px-4 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                    {userInitial}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {user?.name || "User"}
                    </p>

                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {user?.email || ""}
                    </p>

                  </div>

                </div>

                <div className="mt-2">

                  <span className="inline-flex rounded-md bg-[var(--color-surface-muted)] px-2 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                    {user?.role || "AGENT"}
                  </span>

                </div>

              </div>


              {/* Menu */}

              <div className="p-1.5">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-surface-muted)]"
                >

                  <LogOut size={17} />

                  <span>Logout</span>

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}