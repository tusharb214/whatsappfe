import {
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  activateOrganization,
  approveOrganization,
  getOrganizations,
  rejectOrganization,
  suspendOrganization,
  type Organization,
} from "../../api/organizationApi";

type StatusFilter =
  | "ALL"
  | Organization["status"];

export default function SuperAdminCompanies() {
  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [openMenu, setOpenMenu] =
    useState<number | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);


  /* =========================================
      LOAD COMPANIES
     ========================================= */

  const loadOrganizations =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getOrganizations();

        setOrganizations(data);
      } catch (err) {
        console.error(
          "Failed to load organizations:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load companies"
        );
      } finally {
        setIsLoading(false);
      }
    }, []);


  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);


  /* =========================================
      FILTER
     ========================================= */

  const filteredOrganizations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return organizations.filter(
        (organization) => {
          const matchesSearch =
            !query ||
            organization.name
              .toLowerCase()
              .includes(query) ||
            organization.email
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            organization.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      organizations,
      search,
      statusFilter,
    ]);


  /* =========================================
      ACTION
     ========================================= */

  const handleAction = async (
    action:
      | "approve"
      | "reject"
      | "suspend"
      | "activate",
    id: number
  ) => {
    try {
      setProcessingId(id);
      setOpenMenu(null);
      setError(null);

      let updated:
        | Organization
        | undefined;

      if (action === "approve") {
        updated =
          await approveOrganization(id);
      }

      if (action === "reject") {
        updated =
          await rejectOrganization(id);
      }

      if (action === "suspend") {
        updated =
          await suspendOrganization(id);
      }

      if (action === "activate") {
        updated =
          await activateOrganization(id);
      }

      if (updated) {
        setOrganizations(
          (current) =>
            current.map(
              (organization) =>
                organization.id === id
                  ? updated!
                  : organization
            )
        );
      }
    } catch (err) {
      console.error(
        "Organization action failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Action failed"
      );
    } finally {
      setProcessingId(null);
    }
  };


  /* =========================================
      STATUS
     ========================================= */

  const getStatus = (
    status: Organization["status"]
  ) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          className:
            "bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };

      case "PENDING":
        return {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-700",
          icon: Clock3,
        };

      case "SUSPENDED":
        return {
          label: "Suspended",
          className:
            "bg-red-50 text-red-700",
          icon: ShieldAlert,
        };

      case "REJECTED":
        return {
          label: "Rejected",
          className:
            "bg-slate-100 text-slate-600",
          icon: XCircle,
        };

      default:
        return {
          label: status,
          className:
            "bg-slate-100 text-slate-600",
          icon: Clock3,
        };
    }
  };


  /* =========================================
      DATE
     ========================================= */

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* =========================================
      LOADING
     ========================================= */

  if (
    isLoading &&
    organizations.length === 0
  ) {
    return (
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Companies
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage all registered organizations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]"
              />
            )
          )}

        </div>

        <div className="h-80 animate-pulse rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]" />

      </div>
    );
  }


  return (
    <div className="space-y-6">

      {/* =========================================
          HEADER
         ========================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Companies
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage all registered organizations
          </p>

        </div>


        <button
          type="button"
          onClick={loadOrganizations}
          disabled={isLoading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw
            size={16}
            className={
              isLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>


      {/* =========================================
          ERROR
         ========================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <XCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="flex-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>

        </div>
      )}


      {/* =========================================
          SUMMARY
         ========================================= */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

          <p className="text-xs text-[var(--color-text-muted)]">
            Total
          </p>

          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {organizations.length}
          </p>

        </div>


        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

          <p className="text-xs text-[var(--color-text-muted)]">
            Approved
          </p>

          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {
              organizations.filter(
                (item) =>
                  item.status ===
                  "APPROVED"
              ).length
            }
          </p>

        </div>


        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

          <p className="text-xs text-[var(--color-text-muted)]">
            Pending
          </p>

          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {
              organizations.filter(
                (item) =>
                  item.status ===
                  "PENDING"
              ).length
            }
          </p>

        </div>


        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

          <p className="text-xs text-[var(--color-text-muted)]">
            Suspended
          </p>

          <p className="mt-1 text-2xl font-semibold text-red-600">
            {
              organizations.filter(
                (item) =>
                  item.status ===
                  "SUSPENDED"
              ).length
            }
          </p>

        </div>

      </div>


      {/* =========================================
          FILTERS
         ========================================= */}

      <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search companies or email..."
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-soft)]"
            />

          </div>


          {/* Status */}

          <div className="relative w-full md:w-48">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="h-10 w-full appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 pr-9 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>

              <option value="REJECTED">
                Rejected
              </option>

            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

          </div>

        </div>

      </div>


      {/* =========================================
          DESKTOP TABLE
         ========================================= */}

      <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-sm md:block">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface-muted)]">

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Company
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Email
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Registered
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredOrganizations.map(
                (organization) => {

                  const status =
                    getStatus(
                      organization.status
                    );

                  const StatusIcon =
                    status.icon;

                  const isProcessing =
                    processingId ===
                    organization.id;

                  return (
                    <tr
                      key={
                        organization.id
                      }
                      className="border-b border-[var(--color-border-light)] last:border-0 hover:bg-[var(--color-surface-muted)]"
                    >

                      {/* Company */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                            {organization.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                              {organization.name}
                            </p>

                            <p className="text-[10px] text-[var(--color-text-muted)]">
                              ID #
                              {
                                organization.id
                              }
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Email */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {
                            organization.email
                          }
                        </span>

                      </td>


                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                        >
                          <StatusIcon
                            size={12}
                          />

                          {
                            status.label
                          }
                        </span>

                      </td>


                      {/* Date */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {formatDate(
                            organization.createdAt
                          )}
                        </span>

                      </td>


                      {/* Actions */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {organization.status ===
                            "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleAction(
                                    "approve",
                                    organization.id
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check
                                  size={14}
                                />
                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleAction(
                                    "reject",
                                    organization.id
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <X
                                  size={14}
                                />
                                Reject
                              </button>
                            </>
                          )}


                          {organization.status ===
                            "APPROVED" && (
                            <button
                              type="button"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleAction(
                                  "suspend",
                                  organization.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <ShieldAlert
                                size={14}
                              />
                              Suspend
                            </button>
                          )}


                          {organization.status ===
                            "SUSPENDED" && (
                            <button
                              type="button"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleAction(
                                  "activate",
                                  organization.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check
                                size={14}
                              />
                              Activate
                            </button>
                          )}


                          {organization.status ===
                            "REJECTED" && (
                            <button
                              type="button"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleAction(
                                  "approve",
                                  organization.id
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check
                                size={14}
                              />
                              Approve
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>


          {/* Empty */}

          {filteredOrganizations.length ===
            0 && (
            <div className="flex min-h-[240px] flex-col items-center justify-center px-5 text-center">

              <Building2
                size={32}
                className="text-[var(--color-text-muted)]"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">
                No companies found
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Try changing your search or status filter.
              </p>

            </div>
          )}

        </div>

      </div>


      {/* =========================================
          MOBILE CARDS
         ========================================= */}

      <div className="space-y-3 md:hidden">

        {filteredOrganizations.map(
          (organization) => {

            const status =
              getStatus(
                organization.status
              );

            const StatusIcon =
              status.icon;

            const isProcessing =
              processingId ===
              organization.id;

            return (
              <div
                key={organization.id}
                className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4 shadow-sm"
              >

                {/* Company */}

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                    {organization.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                          {
                            organization.name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                          {
                            organization.email
                          }
                        </p>

                      </div>


                      {/* More */}

                      <div className="relative">

                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu ===
                                organization.id
                                ? null
                                : organization.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
                        >
                          <MoreVertical
                            size={17}
                          />
                        </button>


                        {openMenu ===
                          organization.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)] p-1 shadow-lg">

                            {organization.status ===
                              "APPROVED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAction(
                                    "suspend",
                                    organization.id
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-red-600 hover:bg-[var(--color-surface-muted)]"
                              >
                                <ShieldAlert
                                  size={14}
                                />
                                Suspend
                              </button>
                            )}

                            {organization.status ===
                              "SUSPENDED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAction(
                                    "activate",
                                    organization.id
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-emerald-600 hover:bg-[var(--color-surface-muted)]"
                              >
                                <Check
                                  size={14}
                                />
                                Activate
                              </button>
                            )}

                            {organization.status ===
                              "REJECTED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAction(
                                    "approve",
                                    organization.id
                                  )
                                }
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-emerald-600 hover:bg-[var(--color-surface-muted)]"
                              >
                                <Check
                                  size={14}
                                />
                                Approve
                              </button>
                            )}

                          </div>
                        )}

                      </div>

                    </div>


                    {/* Status */}

                    <div className="mt-3 flex items-center justify-between">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                      >

                        <StatusIcon
                          size={12}
                        />

                        {status.label}

                      </span>

                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatDate(
                          organization.createdAt
                        )}
                      </span>

                    </div>

                  </div>

                </div>


                {/* Pending actions */}

                {organization.status ===
                  "PENDING" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        handleAction(
                          "approve",
                          organization.id
                        )
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <Check
                        size={14}
                      />
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        handleAction(
                          "reject",
                          organization.id
                        )
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      <X
                        size={14}
                      />
                      Reject
                    </button>

                  </div>
                )}

              </div>
            );
          }
        )}


        {filteredOrganizations.length ===
          0 && (
          <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] px-5 py-12 text-center">

            <Building2
              size={30}
              className="mx-auto text-[var(--color-text-muted)]"
            />

            <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">
              No companies found
            </p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Try changing your search or status filter.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}