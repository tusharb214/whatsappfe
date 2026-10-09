import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Inbox from "../pages/inbox/Inbox";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import SuperAdminRoute from "./SuperAdminRoute";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Contacts from "../pages/contacts/Contacts";

import Categories from "../pages/catalogue/Categories";
import Products from "../pages/catalogue/Products";
import ProductDetails from "../pages/catalogue/ProductDetails";

import WhatsApp from "../pages/whatsapp/WhatsApp";
import ConnectWhatsApp from "../pages/whatsapp/ConnectWhatsApp";

import SuperAdminDashboard from "../pages/super-admin/SuperAdminDashboard";
import SuperAdminCompanies from "../pages/super-admin/SuperAdminCompanies";
import SuperAdminUsers from "../pages/super-admin/SuperAdminUsers";
import FlowBuilder from "../pages/flows/FlowBuilder";
import { useParams } from "react-router-dom";
import Flows from "../pages/flows/Flows";

import MainLayout from "../components/layout/MainLayout";

function FlowBuilderRoute() {
  const { flowId } = useParams();

  const id = Number(flowId);

  if (!flowId || Number.isNaN(id)) {
    return <Navigate to="/flows" replace />;
  }

  return (
    <FlowBuilder
      flowId={id}
      flowName={`Flow #${id}`}
      onBack={() => window.history.back()}
    />
  );
}

export default function AppRoutes() {


  return (
    <BrowserRouter>
      <Routes>

        {/* =========================================
            PUBLIC ROUTES
           ========================================= */}
 <Route element={<PublicRoute />}>
  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/signup"
    element={<Signup />}
  />
</Route>


        {/* =========================================
            SUPER ADMIN ROUTES
           ========================================= */}

        <Route element={<SuperAdminRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/super-admin/dashboard"
              element={<SuperAdminDashboard />}
            />

            <Route
              path="/super-admin/companies"
              element={<SuperAdminCompanies />}
            />

            <Route
              path="/super-admin/users"
              element={<SuperAdminUsers />}
            />

          </Route>

        </Route>


        {/* =========================================
            NORMAL PROTECTED ROUTES
           ========================================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* Dashboard */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* Inbox */}

            <Route
              path="/inbox"
              element={<Inbox />}
            />


            {/* Contacts */}

            <Route
              path="/contacts"
              element={<Contacts />}
            />


            {/* Catalogue */}

            <Route
              path="/catalogue/categories"
              element={<Categories />}
            />

            <Route
              path="/catalogue/products"
              element={<Products />}
            />

            <Route
              path="/catalogue/products/:id"
              element={<ProductDetails />}
            />
            <Route
              path="/flows/:flowId/builder"
              element={<FlowBuilderRoute />}
            />

            {/* Flows */}

            <Route
              path="/flows"
              element={<Flows />}
            />

            <Route
              path="/flows/:flowId/builder"
              element={<FlowBuilderRoute />}
            />

            {/* =====================================
                WHATSAPP
               ===================================== */}

            <Route
              path="/whatsapp"
              element={<WhatsApp />}
            />

            <Route
              path="/whatsapp/connect"
              element={<ConnectWhatsApp />}
            />

          </Route>

        </Route>


        {/* =========================================
            DEFAULT ROUTES
           ========================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}