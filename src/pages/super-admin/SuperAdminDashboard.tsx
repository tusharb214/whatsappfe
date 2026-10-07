import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Clock3,
    RefreshCw,
    ShieldAlert,
    Users,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    getOrganizations,
    type Organization,
} from "../../api/organizationApi";

export default function SuperAdminDashboard() {
    const [organizations, setOrganizations] = useState<
        Organization[]
    >([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [lastUpdated, setLastUpdated] =
        useState<Date | null>(null);


    /* =========================================
        FETCH ORGANIZATIONS
       ========================================= */

    const fetchOrganizations =
        useCallback(async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await getOrganizations();

                setOrganizations(data);
                setLastUpdated(new Date());
            } catch (err) {
                console.error(
                    "Failed to load organizations:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load organizations"
                );
            } finally {
                setIsLoading(false);
            }
        }, []);


    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);


    /* =========================================
        CALCULATE REAL STATISTICS
       ========================================= */

    const statistics = useMemo(() => {
        return {
            total: organizations.length,

            approved: organizations.filter(
                (organization) =>
                    organization.status === "APPROVED"
            ).length,

            pending: organizations.filter(
                (organization) =>
                    organization.status === "PENDING"
            ).length,

            suspended: organizations.filter(
                (organization) =>
                    organization.status === "SUSPENDED"
            ).length,

            rejected: organizations.filter(
                (organization) =>
                    organization.status === "REJECTED"
            ).length,
        };
    }, [organizations]);


    /* =========================================
        STATUS CHART DATA
       ========================================= */

    const statusChartData = useMemo(() => {
        return [
            {
                name: "Approved",
                value: statistics.approved,
            },
            {
                name: "Pending",
                value: statistics.pending,
            },
            {
                name: "Suspended",
                value: statistics.suspended,
            },
            {
                name: "Rejected",
                value: statistics.rejected,
            },
        ].filter((item) => item.value > 0);
    }, [statistics]);


    /* =========================================
        COMPANY REGISTRATION GRAPH
       ========================================= */

    const registrationChartData = useMemo(() => {
        const grouped: Record<
            string,
            number
        > = {};

        organizations.forEach((organization) => {
            const date = new Date(
                organization.createdAt
            );

            if (Number.isNaN(date.getTime())) {
                return;
            }

            const key =
                date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                });

            grouped[key] =
                (grouped[key] || 0) + 1;
        });

        return Object.entries(grouped)
            .map(([date, count]) => ({
                date,
                companies: count,
            }))
            .slice(-14);
    }, [organizations]);


    /* =========================================
        RECENT COMPANIES
       ========================================= */

    const recentCompanies = useMemo(() => {
        return [...organizations]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .slice(0, 6);
    }, [organizations]);


    /* =========================================
        FORMAT DATE
       ========================================= */

    const formatDate = (
        dateString: string
    ) => {
        const date = new Date(dateString);

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
        STATUS STYLING
       ========================================= */

    const getStatusStyle = (
        status: Organization["status"]
    ) => {
        switch (status) {
            case "APPROVED":
                return {
                    label: "Approved",
                    className:
                        "bg-emerald-50 text-emerald-700",
                };

            case "PENDING":
                return {
                    label: "Pending",
                    className:
                        "bg-amber-50 text-amber-700",
                };

            case "SUSPENDED":
                return {
                    label: "Suspended",
                    className:
                        "bg-red-50 text-red-700",
                };

            case "REJECTED":
                return {
                    label: "Rejected",
                    className:
                        "bg-slate-100 text-slate-600",
                };

            default:
                return {
                    label: status,
                    className:
                        "bg-slate-100 text-slate-600",
                };
        }
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
                        Super Admin Dashboard
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Monitor companies and platform activity
                    </p>
                </div>


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]"
                            />
                        )
                    )}

                </div>

            </div>
        );
    }


    /* =========================================
        ERROR
       ========================================= */

    if (
        error &&
        organizations.length === 0
    ) {
        return (
            <div className="space-y-6">

                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                        Super Admin Dashboard
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Monitor companies and platform activity
                    </p>
                </div>


                <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                    <div className="flex items-start gap-3">

                        <AlertCircle
                            size={21}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div className="flex-1">

                            <h3 className="text-sm font-semibold text-red-800">
                                Unable to load companies
                            </h3>

                            <p className="mt-1 text-sm text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchOrganizations}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                                <RefreshCw size={14} />
                                Retry
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* =========================================
          PAGE HEADER
         ========================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                        Super Admin Dashboard
                    </h2>

                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Monitor companies and platform activity
                    </p>

                </div>


                <div className="flex items-center gap-3">

                    {lastUpdated && (
                        <span className="text-xs text-[var(--color-text-muted)]">
                            Updated{" "}
                            {lastUpdated.toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={fetchOrganizations}
                        disabled={isLoading}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={14}
                            className={
                                isLoading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                </div>

            </div>


            {/* =========================================
          STAT CARDS
         ========================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-xs font-medium text-[var(--color-text-muted)]">
                                Total Companies
                            </p>

                            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                                {statistics.total}
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Building2 size={20} />
                        </div>

                    </div>

                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                        All registered organizations
                    </p>

                </div>


                {/* Approved */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-xs font-medium text-[var(--color-text-muted)]">
                                Active Companies
                            </p>

                            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                                {statistics.approved}
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={20} />
                        </div>

                    </div>

                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                        Approved organizations
                    </p>

                </div>


                {/* Pending */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-xs font-medium text-[var(--color-text-muted)]">
                                Pending Approval
                            </p>

                            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                                {statistics.pending}
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Clock3 size={20} />
                        </div>

                    </div>

                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                        Waiting for review
                    </p>

                </div>


                {/* Suspended */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-xs font-medium text-[var(--color-text-muted)]">
                                Suspended
                            </p>

                            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                                {statistics.suspended}
                            </p>

                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                            <ShieldAlert size={20} />
                        </div>

                    </div>

                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                        Currently suspended
                    </p>

                </div>

            </div>


            {/* =========================================
          CHARTS
         ========================================= */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">

                {/* Company Registration */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="mb-5">

                        <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            Company Registrations
                        </h3>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Organizations registered over time
                        </p>

                    </div>


                    <div className="h-[280px]">

                        {registrationChartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
                                No registration data available
                            </div>
                        ) : (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={registrationChartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fontSize: 11,
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="companies"
                                        name="Companies"
                                        fill="var(--color-primary)"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={70}
                                    />

                                </BarChart>
                            </ResponsiveContainer>
                        )}

                    </div>

                </div>


                {/* Status Distribution */}

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-sm">

                    <div className="mb-2">

                        <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            Company Status
                        </h3>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Current organization status
                        </p>

                    </div>


                    <div className="h-[280px]">

                        {statusChartData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
                                No status data available
                            </div>
                        ) : (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>

                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={3}
                                    >

                                        {statusChartData.map(
                                            (entry) => {

                                                let fill =
                                                    "#94a3b8";

                                                if (
                                                    entry.name ===
                                                    "Approved"
                                                ) {
                                                    fill =
                                                        "#10b981";
                                                }

                                                if (
                                                    entry.name ===
                                                    "Pending"
                                                ) {
                                                    fill =
                                                        "#f59e0b";
                                                }

                                                if (
                                                    entry.name ===
                                                    "Suspended"
                                                ) {
                                                    fill =
                                                        "#ef4444";
                                                }

                                                return (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={fill}
                                                    />
                                                );
                                            }
                                        )}

                                    </Pie>

                                    <Tooltip />

                                </PieChart>
                            </ResponsiveContainer>
                        )}

                    </div>


                    <div className="grid grid-cols-2 gap-2">

                        {[
                            {
                                label: "Approved",
                                value: statistics.approved,
                            },
                            {
                                label: "Pending",
                                value: statistics.pending,
                            },
                            {
                                label: "Suspended",
                                value: statistics.suspended,
                            },
                            {
                                label: "Rejected",
                                value: statistics.rejected,
                            },
                        ].map((item) => (

                            <div
                                key={item.label}
                                className="flex items-center justify-between rounded-lg bg-[var(--color-surface-muted)] px-3 py-2"
                            >

                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    {item.label}
                                </span>

                                <span className="text-xs font-semibold text-[var(--color-text)]">
                                    {item.value}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            {/* =========================================
          RECENT COMPANIES
         ========================================= */}

            <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-sm">

                <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">

                    <div>

                        <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            Recent Companies
                        </h3>

                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            Latest registered organizations
                        </p>

                    </div>

                    <Building2
                        size={18}
                        className="text-[var(--color-text-muted)]"
                    />

                </div>


                {recentCompanies.length === 0 ? (
                    <div className="flex min-h-[180px] items-center justify-center px-5">

                        <div className="text-center">

                            <Building2
                                size={28}
                                className="mx-auto text-[var(--color-text-muted)]"
                            />

                            <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
                                No companies registered
                            </p>

                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                Registered organizations will appear here.
                            </p>

                        </div>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[650px]">

                            <thead>

                                <tr className="border-b border-[var(--color-border-light)] text-left">

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                        Company
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                        Email
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                        Registered
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {recentCompanies.map(
                                    (organization) => {

                                        const status =
                                            getStatusStyle(
                                                organization.status
                                            );

                                        return (
                                            <tr
                                                key={organization.id}
                                                className="border-b border-[var(--color-border-light)] last:border-b-0"
                                            >

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                                                            {organization.name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                "C"}
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                                                {organization.name}
                                                            </p>

                                                            <p className="text-[10px] text-[var(--color-text-muted)]">
                                                                ID #{organization.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                                        {organization.email}
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                                                    >
                                                        {status.label}
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                                        {formatDate(
                                                            organization.createdAt
                                                        )}
                                                    </span>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* =========================================
          SMALL PLATFORM SUMMARY
         ========================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Building2 size={18} />
                        </div>

                        <div>

                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                                Organizations
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
                                {statistics.total}
                            </p>

                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Users size={18} />
                        </div>

                        <div>

                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                                Active Rate
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
                                {statistics.total > 0
                                    ? `${Math.round(
                                        (statistics.approved /
                                            statistics.total) *
                                        100
                                    )}%`
                                    : "0%"}
                            </p>

                        </div>

                    </div>

                </div>


                <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Clock3 size={18} />
                        </div>

                        <div>

                            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                                Awaiting Review
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text)]">
                                {statistics.pending}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}