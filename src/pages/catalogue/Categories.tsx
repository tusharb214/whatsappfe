import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  FolderTree,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createCategory,
  deactivateCategory,
  getCategories,
  updateCategory,
  type Category,
} from "../../api/categoryApi";

import { useAuth } from "../../hooks/useAuth";

type CategoryForm = {
  name: string;
  description: string;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
};

export default function Categories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canManage =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /*
   * =========================================================
   * LOAD CATEGORIES
   * =========================================================
   */

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCategories();

      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name?.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
    });
  }, [categories, search]);

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const activeCount = categories.filter(
    (category) => category.status === "ACTIVE"
  ).length;

  const inactiveCount = categories.filter(
    (category) => category.status === "INACTIVE"
  ).length;

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  const handleCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  const handleEdit = (category: Category) => {
    setEditingCategory(category);

    setForm({
      name: category.name ?? "",
      description: category.description ?? "",
    });

    setError(null);
    setShowModal(true);
  };

  /*
   * =========================================================
   * CLOSE MODAL
   * =========================================================
   */

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  const handleSave = async () => {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingCategory) {
        const updated = await updateCategory(
          editingCategory.id,
          {
            name,
            description: description || undefined,
          }
        );

        setCategories((previous) =>
          previous.map((category) =>
            category.id === updated.id
              ? updated
              : category
          )
        );
      } else {
        const created = await createCategory({
          name,
          description: description || undefined,
        });

        setCategories((previous) => [
          created,
          ...previous,
        ]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save category:", err);

      setError(
        "Failed to save category. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * DEACTIVATE
   * =========================================================
   */

  const handleDeactivate = async (category: Category) => {
    const confirmed = window.confirm(
      `Deactivate category "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError(null);

      await deactivateCategory(category.id);

      setCategories((previous) =>
        previous.map((item) =>
          item.id === category.id
            ? {
                ...item,
                status: "INACTIVE",
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to deactivate category:",
        err
      );

      setError(
        "Failed to deactivate category. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * =========================================================
   * DATE
   * =========================================================
   */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * =========================================================
   * INITIALS
   * =========================================================
   */

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <>
      <div className="space-y-5">
        {/* ===================================================
            PAGE HEADER
           =================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <FolderTree size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Categories
              </h2>

              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Organize your product catalogue
              </p>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-primary-hover)]"
            >
              <Plus size={17} />
              Add Category
            </button>
          )}
        </div>

        {/* ===================================================
            STATS
           =================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Total Categories
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Active
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Inactive
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-text-muted)]">
              {inactiveCount}
            </p>
          </div>
        </div>

        {/* ===================================================
            SEARCH
           =================================================== */}

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-xs)]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search categories..."
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)]"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            ERROR
           =================================================== */}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-danger)]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ===================================================
            CATEGORY LIST
           =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--color-surface-muted)]" />

                  <div className="flex-1">
                    <div className="mb-2 h-3 w-40 rounded bg-[var(--color-surface-muted)]" />

                    <div className="h-3 w-64 max-w-full rounded bg-[var(--color-surface-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <FolderTree size={25} />
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {search
                  ? "No categories found"
                  : "No categories yet"}
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
                {search
                  ? "Try a different search term."
                  : "Create your first category to organize your products."}
              </p>

              {!search && canManage && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 text-xs font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)]"
                >
                  <Plus size={15} />
                  Add Category
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
                 ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Description
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Created
                      </th>

                      {canManage && (
                        <th className="w-28 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-[var(--color-border)] last:border-b-0 transition hover:bg-[var(--color-surface-hover)]"
                      >
                        {/* Category */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary)]">
                              {getInitials(category.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                {category.name}
                              </p>

                              <p className="text-[10px] text-[var(--color-text-muted)]">
                                ID #{category.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5">
                          <p className="max-w-[300px] truncate text-sm text-[var(--color-text-secondary)]">
                            {category.description || "—"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              category.status === "ACTIVE"
                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {category.status}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">
                          {formatDate(category.createdAt)}
                        </td>

                        {/* Actions */}
                        {canManage && (
                          <td className="px-4 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(category)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                title="Edit category"
                              >
                                <Edit3 size={15} />
                              </button>

                              {category.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeactivate(
                                      category
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    category.id
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                  title="Deactivate category"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}

                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
                                title="More options"
                              >
                                <MoreVertical size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
                 ================================================= */}

              <div className="divide-y divide-[var(--color-border)] md:hidden">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-4 transition hover:bg-[var(--color-surface-hover)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                        {getInitials(category.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                              ID #{category.id}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                              category.status === "ACTIVE"
                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {category.status}
                          </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                          {category.description ||
                            "No description"}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Created{" "}
                            {formatDate(category.createdAt)}
                          </span>

                          {canManage && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(category)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                title="Edit category"
                              >
                                <Edit3 size={15} />
                              </button>

                              {category.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeactivate(
                                      category
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    category.id
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                  title="Deactivate category"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
         ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] sm:max-w-lg sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h3>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {editingCategory
                    ? "Update category information"
                    : "Create a new product category"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 px-5 py-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Category Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Men's Fashion"
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional category description..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="h-10 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="h-10 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Save Changes"
                    : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}