 import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  activateUser,
  createOrganizationAdmin,
  deactivateUser,
  getUsers,
  type User,
} from "../../api/userApi";

import { getOrganizations, type Organization } from "../../api/organizationApi";

export default function SuperAdminUsers() {
  // =========================================
  // STATE
  // =========================================

  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [creating, setCreating] = useState(false);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationId: "",
  });

  // =========================================
  // LOAD USERS
  // =========================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD ORGANIZATIONS
  // =========================================

  const loadOrganizations = async () => {
    try {
      const data = await getOrganizations();

      setOrganizations(data);
    } catch (err) {
      console.error(
        "Failed to load organizations:",
        err
      );
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadUsers();
    loadOrganizations();
  }, []);

  // =========================================
  // FILTER USERS
  // =========================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        user.name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue) ||
        (user.organizationName ?? "")
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =========================================
  // COUNTS
  // =========================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const agentUsers = users.filter(
    (user) => user.role === "AGENT"
  ).length;

  // =========================================
  // ACTIVATE / DEACTIVATE
  // =========================================

  const handleStatusChange = async (
    user: User
  ) => {
    try {
      setActionUserId(user.id);
      setError("");

      let updatedUser: User;

      if (user.status === "ACTIVE") {
        updatedUser = await deactivateUser(
          user.id
        );
      } else {
        updatedUser = await activateUser(
          user.id
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id
            ? updatedUser
            : currentUser
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status"
      );
    } finally {
      setActionUserId(null);
    }
  };

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleFormChange = (
    field: string,
    value: string
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
  };

  // =========================================
  // CREATE ADMIN
  // =========================================

  const handleCreateAdmin = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!formData.password) {
      setFormError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setFormError(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (!formData.organizationId) {
      setFormError(
        "Please select an organization"
      );
      return;
    }

    try {
      setCreating(true);

      const createdUser =
        await createOrganizationAdmin(
          Number(formData.organizationId),
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: "ADMIN",
          }
        );

      setUsers((currentUsers) => [
        createdUser,
        ...currentUsers,
      ]);

      setFormData({
        name: "",
        email: "",
        password: "",
        organizationId: "",
      });

      setShowCreateModal(false);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to create admin"
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // ROLE BADGE
  // =========================================

  const getRoleBadge = (
    role: User["role"]
  ) => {
    if (role === "SUPER_ADMIN") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
          <Shield size={13} />
          Super Admin
        </span>
      );
    }

    if (role === "ADMIN") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          <UserCheck size={13} />
          Admin
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
        <Users size={13} />
        Agent
      </span>
    );
  };

  // =========================================
  // STATUS BADGE
  // =========================================

  const getStatusBadge = (
    status: User["status"]
  ) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={13} />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        <UserX size={13} />
        Inactive
      </span>
    );
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="min-h-full w-full bg-gray-50 p-4 sm:p-6 lg:p-8">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all users across SiteGenius
            organizations
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateModal(true)
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
        >
          <Plus size={18} />
          Create Admin
        </button>
      </div>

      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ===================================== */}
      {/* STAT CARDS */}
      {/* ===================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {/* Total */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Users
                size={20}
                className="text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {activeUsers}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <CheckCircle2
                size={20}
                className="text-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {inactiveUsers}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <UserX
                size={20}
                className="text-red-600"
              />
            </div>
          </div>
        </div>

        {/* Admins */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Admins
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {adminUsers}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Shield
                size={20}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Agents */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Agents
              </p>

              <p className="mt-2 text-2xl font-bold text-purple-600">
                {agentUsers}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-3">
              <UserPlus
                size={20}
                className="text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* FILTER BAR */}
      {/* ===================================== */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search users, email or company..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* Role */}

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
              className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-gray-400 sm:w-48"
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="SUPER_ADMIN">
                Super Admin
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="AGENT">
                Agent
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Status */}

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-gray-400 sm:w-48"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

        </div>
      </div>

      {/* ===================================== */}
      {/* USERS */}
      {/* ===================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2
                size={20}
                className="animate-spin"
              />
              Loading users...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <Users
                size={26}
                className="text-gray-400"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No users found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* ================================= */}
            {/* DESKTOP TABLE */}
            {/* ================================= */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Company
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredUsers.map((user) => (

                    <tr
                      key={user.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* User */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-700">
                            {user.name
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {user.name}
                            </p>

                            <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                              <Mail size={12} />
                              {user.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Role */}

                      <td className="px-5 py-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Company */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-gray-800">
                          {user.organizationName || "Platform"}
                        </p>

                        {user.organizationId && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            ID: {user.organizationId}
                          </p>
                        )}

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        {getStatusBadge(user.status)}
                      </td>

                      {/* Created */}

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4 text-right">

                        {user.role === "SUPER_ADMIN" ? (
                          <span className="text-xs font-medium text-gray-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              actionUserId === user.id
                            }
                            onClick={() =>
                              handleStatusChange(user)
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.status === "ACTIVE"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >

                            {actionUserId === user.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : user.status ===
                              "ACTIVE" ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}

                            {user.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}

                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            </div>

            {/* ================================= */}
            {/* MOBILE / TABLET CARDS */}
            {/* ================================= */}

            <div className="divide-y divide-gray-100 lg:hidden">

              {filteredUsers.map((user) => (

                <div
                  key={user.id}
                  className="p-4 sm:p-5"
                >

                  {/* User header */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-bold text-gray-700">
                        {user.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
                          <Mail size={12} />
                          {user.email}
                        </p>

                      </div>

                    </div>

                    {getStatusBadge(user.status)}

                  </div>

                  {/* Details */}

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Role
                      </p>

                      <div className="mt-1">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Company
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {user.organizationName ||
                          "Platform"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Created
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>

                  </div>

                  {/* Action */}

                  {user.role !== "SUPER_ADMIN" && (
                    <button
                      type="button"
                      disabled={
                        actionUserId === user.id
                      }
                      onClick={() =>
                        handleStatusChange(user)
                      }
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.status === "ACTIVE"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >

                      {actionUserId === user.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : user.status ===
                        "ACTIVE" ? (
                        <UserX size={16} />
                      ) : (
                        <UserCheck size={16} />
                      )}

                      {user.status === "ACTIVE"
                        ? "Deactivate User"
                        : "Activate User"}

                    </button>
                  )}

                </div>

              ))}

            </div>
          </>
        )}
      </div>

      {/* ===================================== */}
      {/* RESULT COUNT */}
      {/* ===================================== */}

      {!loading && (
        <div className="mt-4 text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filteredUsers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {users.length}
          </span>{" "}
          users
        </div>
      )}

      {/* ===================================== */}
      {/* CREATE ADMIN MODAL */}
      {/* ===================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Create Organization Admin
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Create an admin account for a company
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleCreateAdmin}
              className="space-y-5 p-5 sm:p-6"
            >

              {/* Error */}

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Name */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    handleFormChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    handleFormChange(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="admin@company.com"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    handleFormChange(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Minimum 6 characters"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
                />
              </div>

              {/* Organization */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Organization
                </label>

                <select
                  value={formData.organizationId}
                  onChange={(event) =>
                    handleFormChange(
                      "organizationId",
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
                >
                  <option value="">
                    Select organization
                  </option>

                  {organizations
                    .filter(
                      (organization) =>
                        organization.status ===
                        "APPROVED"
                    )
                    .map((organization) => (
                      <option
                        key={organization.id}
                        value={organization.id}
                      >
                        {organization.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Role */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <Shield
                    size={17}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    ADMIN
                  </span>

                  <span className="ml-auto text-xs text-gray-400">
                    Organization Admin
                  </span>
                </div>
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  disabled={creating}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creating ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Create Admin
                    </>
                  )}

                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}