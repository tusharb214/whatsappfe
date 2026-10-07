import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import PageContainer from "./PageContainer";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/dashboard") {
      return {
        title: "Dashboard",
        subtitle: "Overview of your workspace",
      };
    }

    if (path.startsWith("/inbox")) {
      return {
        title: "Inbox",
        subtitle: "Manage your customer conversations",
      };
    }

    if (path.startsWith("/contacts")) {
      return {
        title: "Contacts",
        subtitle: "Manage your customer contacts",
      };
    }

    if (path.startsWith("/catalogue/products")) {
      return {
        title: "Products",
        subtitle: "Manage your product catalogue",
      };
    }

    if (path.startsWith("/catalogue/categories")) {
      return {
        title: "Categories",
        subtitle: "Organize your product catalogue",
      };
    }

    if (path.startsWith("/catalogue")) {
      return {
        title: "Catalogue",
        subtitle: "Manage your products and categories",
      };
    }

    if (path.startsWith("/whatsapp")) {
      return {
        title: "WhatsApp",
        subtitle: "Manage your WhatsApp business numbers",
      };
    }

    if (path.startsWith("/team")) {
      return {
        title: "Team",
        subtitle: "Manage your team members and agents",
      };
    }

    if (path.startsWith("/settings")) {
      return {
        title: "Settings",
        subtitle: "Manage your workspace settings",
      };
    }

    if (path.startsWith("/analytics")) {
      return {
        title: "Analytics",
        subtitle: "Track your business performance",
      };
    }

    if (path.startsWith("/templates")) {
      return {
        title: "Templates",
        subtitle: "Manage your WhatsApp message templates",
      };
    }

    return {
      title: "SiteGenius",
      subtitle: undefined,
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex min-h-screen w-full bg-[var(--color-bg)]">

      {/* =========================================
          SIDEBAR
         ========================================= */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />


      {/* =========================================
          MAIN AREA
         ========================================= */}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[var(--sidebar-width)]">

        {/* Header */}

        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />


        {/* Page content */}

        <PageContainer>
          <Outlet />
        </PageContainer>

      </div>

    </div>
  );
}