import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Workflow } from "lucide-react";
import { createFlow } from "../../api/flowApi";

interface CreateFlowProps {
  onBack?: () => void;
}

export default function CreateFlow({ onBack }: CreateFlowProps) {
      const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Flow name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const flow = await createFlow({
        name: name.trim(),
        description: description.trim(),
      });

      console.log("Flow created:", flow);

     navigate(`/flows/${flow.id}/builder`);
    } catch (err) {
      console.error("Failed to create flow:", err);
      setError("Failed to create flow.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft size={17} />
          Back to Flows
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-7">

          <div className="mb-7 flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Workflow size={23} />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text)]">
                Create Flow
              </h1>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Create a new WhatsApp Flow and start building its
                conversation experience.
              </p>
            </div>

          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Flow name */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Flow Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Customer Registration"
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Description */}
          <div className="mb-7">
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this flow is used for..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onBack}
              className="h-11 rounded-xl border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />

              {loading ? "Creating..." : "Create Flow"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}