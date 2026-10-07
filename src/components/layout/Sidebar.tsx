 import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  Smartphone,
  Tags,
  Users,
  X,
  Workflow,
} from "lucide-react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = true,
  onClose,
}: SidebarProps) {
  const { user } = useAuth();

  const [catalogueOpen, setCatalogueOpen] =
    useState(true);

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  const isSuperAdmin =
    user?.role === "SUPER_ADMIN";

  /*
   * =========================================
   * NORMAL USER / ADMIN NAVIGATION
   * =========================================
   */

  const navigationItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Inbox",
      path: "/inbox",
      icon: Inbox,
      badge: 12,
    },
    {
      label: "Contacts",
      path: "/contacts",
      icon: Users,
    },
     {
    label: "Flows",
    path: "/flows",
    icon: Workflow,
  },
  ];

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
         ========================================= */}

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}


      {/* =========================================
          SIDEBAR
         ========================================= */}

      <aside
        className={`sidebar ${
          isOpen
            ? "sidebar-open"
            : "sidebar-closed"
        }`}
      >

        {/* =======================================
            LOGO
           ======================================= */}

        <div className="sidebar-brand">

          <NavLink
            to={
              isSuperAdmin
                ? "/super-admin/dashboard"
                : "/dashboard"
            }
            className="sidebar-brand-link"
            onClick={onClose}
          >

            <div className="sidebar-logo">
              S
            </div>

            <div className="sidebar-brand-text">

              <div className="sidebar-brand-name">
                SiteGenius
              </div>

              <div className="sidebar-brand-subtitle">
                WhatsApp Platform
              </div>

            </div>

          </NavLink>


          {/* Mobile close */}

          <button
            type="button"
            className="sidebar-close-button"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>

        </div>


        {/* =======================================
            NAVIGATION
           ======================================= */}

        <nav className="sidebar-navigation">

          {/* =====================================================
              NORMAL USER / ADMIN SIDEBAR
              SUPER ADMIN ला हा पूर्ण section दिसणार नाही
             ===================================================== */}

          {!isSuperAdmin && (
            <>

              {/* =====================================
                  MAIN
                 ===================================== */}

              <div className="sidebar-section-label">
                Main
              </div>


              {navigationItems.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${
                        isActive
                          ? "sidebar-nav-item-active"
                          : ""
                      }`
                    }
                  >

                    <Icon
                      size={18}
                      strokeWidth={1.9}
                    />

                    <span>
                      {item.label}
                    </span>

                    {item.badge !== undefined && (
                      <span className="sidebar-nav-badge">
                        {item.badge}
                      </span>
                    )}

                  </NavLink>
                );
              })}


              {/* =====================================
                  CATALOGUE
                 ===================================== */}

              <button
                type="button"
                className={`sidebar-nav-item sidebar-parent-item ${
                  catalogueOpen
                    ? "sidebar-parent-open"
                    : ""
                }`}
                onClick={() =>
                  setCatalogueOpen(
                    (value) => !value
                  )
                }
              >

                <Package
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Catalogue
                </span>

                <span className="sidebar-parent-chevron">

                  {catalogueOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}

                </span>

              </button>


              {/* Catalogue submenu */}

              {catalogueOpen && (
                <div className="sidebar-submenu">

                  <NavLink
                    to="/catalogue/products"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-submenu-item ${
                        isActive
                          ? "sidebar-submenu-item-active"
                          : ""
                      }`
                    }
                  >

                    <Package size={15} />

                    <span>
                      Products
                    </span>

                  </NavLink>


                  <NavLink
                    to="/catalogue/categories"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-submenu-item ${
                        isActive
                          ? "sidebar-submenu-item-active"
                          : ""
                      }`
                    }
                  >

                    <Tags size={15} />

                    <span>
                      Categories
                    </span>

                  </NavLink>

                </div>
              )}


              {/* =====================================
                  WHATSAPP
                 ===================================== */}

              <NavLink
                to="/whatsapp"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <Smartphone
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  WhatsApp
                </span>

                <span className="sidebar-live-dot" />

              </NavLink>


              {/* =====================================
                  WORKSPACE
                 ===================================== */}

              <div className="sidebar-section-label sidebar-section-workspace">
                Workspace
              </div>


              <NavLink
                to="/team"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <Users
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Team
                </span>

              </NavLink>


              {/* Settings */}

              <NavLink
                to="/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <Settings
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Settings
                </span>

              </NavLink>


              {/* =====================================
                  ADMIN AREA
                 ===================================== */}

              {isAdmin && (
                <>
                  <div className="sidebar-section-label sidebar-section-admin">
                    Administration
                  </div>


                  {/* Analytics */}

                  <NavLink
                    to="/analytics"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${
                        isActive
                          ? "sidebar-nav-item-active"
                          : ""
                      }`
                    }
                  >

                    <BarChart3
                      size={18}
                      strokeWidth={1.9}
                    />

                    <span>
                      Analytics
                    </span>

                  </NavLink>


                  {/* Templates */}

                  <NavLink
                    to="/templates"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${
                        isActive
                          ? "sidebar-nav-item-active"
                          : ""
                      }`
                    }
                  >

                    <MessageCircle
                      size={18}
                      strokeWidth={1.9}
                    />

                    <span>
                      Templates
                    </span>

                  </NavLink>

                </>
              )}

            </>
          )}


          {/* =====================================================
              SUPER ADMIN SIDEBAR
             ===================================================== */}

          {isSuperAdmin && (
            <>

              {/* =====================================
                  SUPER ADMIN
                 ===================================== */}

              <div className="sidebar-section-label sidebar-section-admin">
                Super Admin
              </div>


              {/* Dashboard */}

              <NavLink
                to="/super-admin/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <LayoutDashboard
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Dashboard
                </span>

              </NavLink>


              {/* Companies */}

              <NavLink
                to="/super-admin/companies"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <Building2
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Companies
                </span>

              </NavLink>


              {/* Users */}

              <NavLink
                to="/super-admin/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${
                    isActive
                      ? "sidebar-nav-item-active"
                      : ""
                  }`
                }
              >

                <Users
                  size={18}
                  strokeWidth={1.9}
                />

                <span>
                  Users
                </span>

              </NavLink>

            </>
          )}

        </nav>


        {/* =======================================
            USER / ORGANIZATION
           ======================================= */}

        <div className="sidebar-user">

          <div className="sidebar-user-card">

            <div className="sidebar-user-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">

              <div className="sidebar-user-name">
                {user?.name || "User"}
              </div>

              <div className="sidebar-user-role">
                {user?.role || "AGENT"}
              </div>

            </div>

            <ChevronRight
              size={16}
              className="sidebar-user-chevron"
            />

          </div>

        </div>

      </aside>
    </>
  );
}