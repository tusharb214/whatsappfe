import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
  Workflow,
} from "lucide-react";
import {
  deleteFlow,
  getFlows,
  type Flow,
} from "../../api/flowApi";
import CreateFlow from "./CreateFlow";

export default function Flows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [showCreateFlow, setShowCreateFlow] = useState(false);

  const loadFlows = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFlows();
      setFlows(data);
    } catch (err) {
      console.error("Failed to load flows:", err);
      setError("Failed to load flows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFlows();
  }, []);

  const handleDelete = async (flow: Flow) => {
    const confirmed = window.confirm(
      `Delete "${flow.name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteFlow(flow.id);

      setFlows((previous) =>
        previous.filter((item) => item.id !== flow.id)
      );
    } catch (err) {
      console.error("Failed to delete flow:", err);
      setError("Failed to delete flow.");
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700";

      case "DRAFT":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (showCreateFlow) {
  return (
    <CreateFlow
      onBack={() => {
        setShowCreateFlow(false);
        void loadFlows();
      }}
    />
  );
}

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <Workflow
              size={22}
              className="text-[var(--color-primary)]"
            />

            <h1 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
              Flows
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Create and manage your WhatsApp flows.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => void loadFlows()}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateFlow(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            <Plus size={17} />
            Create Flow
          </button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Workflow size={19} />
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Total Flows
          </p>

          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {flows.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <FileText size={19} />
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Drafts
          </p>

          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {flows.filter((flow) => flow.status === "DRAFT").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Activity size={19} />
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Published
          </p>

          <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
            {flows.filter(
              (flow) => flow.status === "PUBLISHED"
            ).length}
          </p>
        </div>

      </div>

      {/* Flow list */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">

        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Your Flows
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 rounded-xl border border-[var(--color-border)] p-4"
              >
                <div className="h-11 w-11 rounded-xl bg-[var(--color-surface-muted)]" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-[var(--color-surface-muted)]" />
                  <div className="h-3 w-64 max-w-full rounded bg-[var(--color-surface-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : flows.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Workflow size={25} />
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              No flows yet
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
              Create your first WhatsApp flow to start building
              interactive customer experiences.
            </p>

            <button
              type="button"
              onClick={() => {
                console.log("Create Flow");
              }}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Create Flow
            </button>

          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">

            {flows.map((flow) => (
              <div
                key={flow.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-[var(--color-surface-hover)] sm:flex-row sm:items-center"
              >

                <div className="flex min-w-0 flex-1 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <Workflow size={20} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {flow.name}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                      {flow.description || "No description"}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                      flow.status
                    )}`}
                  >
                    {flow.status}
                  </span>

                  <span className="hidden text-xs text-[var(--color-text-muted)] md:block">
                    v{flow.version}
                  </span>

                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === flow.id
                            ? null
                            : flow.id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenu === flow.id && (
                      <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            console.log("Open flow", flow.id);
                          }}
                          className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            void handleDelete(flow);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </div>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}