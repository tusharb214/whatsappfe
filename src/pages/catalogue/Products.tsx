import { useEffect, useMemo, useState } from "react";
import {
    Edit3,
    Image as ImageIcon,
    MoreVertical,
    Package,
    Plus,
    Search,
    Trash2,
    X,
    Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    createProduct,
    deactivateProduct,
    getProducts,
    updateProduct,
    type Product,
    type ProductRequest,
} from "../../api/productApi";

import {
    getActiveCategories,
    type Category,
} from "../../api/categoryApi";

import { useAuth } from "../../hooks/useAuth";

type ProductForm = {
    name: string;
    description: string;
    price: string;
    currency: string;
    imageUrl: string;
    sku: string;
    categoryId: string;
};

const emptyForm: ProductForm = {
    name: "",
    description: "",
    price: "",
    currency: "INR",
    imageUrl: "",
    sku: "",
    categoryId: "",
};

export default function Products() {
    const { user } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] =
        useState(true);

    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] =
        useState<Product | null>(null);

    const [form, setForm] = useState<ProductForm>(emptyForm);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    /*
     * =========================================================
     * ROLE
     * =========================================================
     */

    const canManage =
        user?.role === "ADMIN" ||
        user?.role === "SUPER_ADMIN";

    /*
     * =========================================================
     * LOAD PRODUCTS
     * =========================================================
     */

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getProducts();

            setProducts(data);
        } catch (err) {
            console.error("Failed to load products:", err);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    /*
     * =========================================================
     * LOAD ACTIVE CATEGORIES
     * =========================================================
     */

    const loadCategories = async () => {
        try {
            setCategoriesLoading(true);

            const data = await getActiveCategories();

            setCategories(data);
        } catch (err) {
            console.error(
                "Failed to load categories:",
                err
            );
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        void loadProducts();
        void loadCategories();
    }, []);

    /*
     * =========================================================
     * FILTER
     * =========================================================
     */

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return products;
        }

        return products.filter((product) => {
            return (
                product.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.sku
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.categoryName
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.description
                    ?.toLowerCase()
                    .includes(keyword)
            );
        });
    }, [products, search]);

    /*
     * =========================================================
     * STATS
     * =========================================================
     */

    const activeCount = products.filter(
        (product) => product.status === "ACTIVE"
    ).length;

    const inactiveCount = products.filter(
        (product) => product.status === "INACTIVE"
    ).length;

    /*
     * =========================================================
     * FORM CHANGE
     * =========================================================
     */

    const handleChange = (
        field: keyof ProductForm,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /*
     * =========================================================
     * CREATE
     * =========================================================
     */

    const handleCreate = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setError(null);
        setShowModal(true);
    };

    /*
     * =========================================================
     * EDIT
     * =========================================================
     */

    const handleEdit = (product: Product) => {
        setEditingProduct(product);

        setForm({
            name: product.name ?? "",
            description: product.description ?? "",
            price: String(product.price ?? ""),
            currency: product.currency ?? "INR",
            imageUrl: product.imageUrl ?? "",
            sku: product.sku ?? "",
            categoryId: product.categoryId
                ? String(product.categoryId)
                : "",
        });

        setError(null);
        setShowModal(true);
    };

    /*
     * =========================================================
     * CLOSE
     * =========================================================
     */

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingProduct(null);
        setForm(emptyForm);
    };

    /*
     * =========================================================
     * SAVE PRODUCT
     * =========================================================
     */

    const handleSave = async () => {
        const name = form.name.trim();
        const sku = form.sku.trim();
        const description = form.description.trim();
        const imageUrl = form.imageUrl.trim();

        if (!name) {
            setError("Product name is required.");
            return;
        }

        if (!sku) {
            setError("SKU is required.");
            return;
        }

        if (!form.price.trim()) {
            setError("Price is required.");
            return;
        }

        const price = Number(form.price);

        if (Number.isNaN(price) || price < 0) {
            setError("Enter a valid product price.");
            return;
        }

        if (!form.currency.trim()) {
            setError("Currency is required.");
            return;
        }

        if (!form.categoryId) {
            setError("Please select a category.");
            return;
        }

        const request: ProductRequest = {
            name,
            description: description || undefined,
            price,
            currency: form.currency.trim().toUpperCase(),
            imageUrl: imageUrl || undefined,
            sku,
            categoryId: Number(form.categoryId),
        };

        try {
            setSaving(true);
            setError(null);

            if (editingProduct) {
                const updated = await updateProduct(
                    editingProduct.id,
                    request
                );

                setProducts((previous) =>
                    previous.map((product) =>
                        product.id === updated.id
                            ? updated
                            : product
                    )
                );
            } else {
                const created = await createProduct(request);

                setProducts((previous) => [
                    created,
                    ...previous,
                ]);
            }

            handleCloseModal();
        } catch (err) {
            console.error("Failed to save product:", err);

            setError(
                "Failed to save product. Please check the details and try again."
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

    const handleDeactivate = async (
        product: Product
    ) => {
        const confirmed = window.confirm(
            `Deactivate product "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(product.id);
            setError(null);

            await deactivateProduct(product.id);

            setProducts((previous) =>
                previous.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            status: "INACTIVE",
                        }
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Failed to deactivate product:",
                err
            );

            setError(
                "Failed to deactivate product. Please try again."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     * =========================================================
     * PRICE
     * =========================================================
     */

    const formatPrice = (
        price: number,
        currency: string
    ) => {
        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency,
                maximumFractionDigits: 2,
            }).format(price);
        } catch {
            return `${currency} ${price}`;
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
            .map((word) =>
                word.charAt(0).toUpperCase()
            )
            .join("");
    };

    return (
        <>
            <div className="space-y-5">
                {/* =================================================
            PAGE HEADER
           ================================================= */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                            <Package size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                Products
                            </h2>

                            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                Manage your product catalogue
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
                            Add Product
                        </button>
                    )}
                </div>

                {/* =================================================
            STATS
           ================================================= */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
                        <p className="text-xs text-[var(--color-text-muted)]">
                            Total Products
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                            {products.length}
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

                {/* =================================================
            SEARCH
           ================================================= */}

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
                            placeholder="Search products, SKU or category..."
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

                {/* =================================================
            ERROR
           ================================================= */}

                {error && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-danger)]">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* =================================================
            PRODUCT LIST
           ================================================= */}

                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                    {loading ? (
                        <div className="space-y-2 p-4">
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-[var(--color-surface-muted)]" />

                                        <div className="flex-1">
                                            <div className="mb-2 h-3 w-40 rounded bg-[var(--color-surface-muted)]" />

                                            <div className="h-3 w-64 max-w-full rounded bg-[var(--color-surface-muted)]" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                <Package size={25} />
                            </div>

                            <h3 className="text-sm font-semibold text-[var(--color-text)]">
                                {search
                                    ? "No products found"
                                    : "No products yet"}
                            </h3>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
                                {search
                                    ? "Try a different search term."
                                    : "Add your first product to start building your catalogue."}
                            </p>

                            {!search && canManage && (
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 text-xs font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)]"
                                >
                                    <Plus size={15} />
                                    Add Product
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* =================================================
                  DESKTOP TABLE
                 ================================================= */}

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                                            <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Product
                                            </th>

                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                SKU
                                            </th>

                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Category
                                            </th>

                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Price
                                            </th>

                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Status
                                            </th>

                                            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                Added
                                            </th>

                                            {canManage && (
                                                <th className="w-28 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredProducts.map(
                                            (product) => (
                                                <tr
                                                    key={product.id}
                                                    className="border-b border-[var(--color-border)] last:border-b-0 transition hover:bg-[var(--color-surface-hover)]"
                                                >
                                                    {/* Product */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="h-12 w-12 shrink-0 rounded-xl border border-[var(--color-border)] object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary)]">
                                                                    {getInitials(
                                                                        product.name
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                                                    {product.name}
                                                                </p>

                                                                <p className="mt-0.5 max-w-[240px] truncate text-xs text-[var(--color-text-muted)]">
                                                                    {product.description ||
                                                                        "No description"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* SKU */}
                                                    <td className="px-4 py-3.5">
                                                        <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-1 font-mono text-[11px] text-[var(--color-text-secondary)]">
                                                            {product.sku}
                                                        </span>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-4 py-3.5">
                                                        {product.categoryName ? (
                                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                                {product.categoryName}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-sm font-semibold text-[var(--color-text)]">
                                                            {formatPrice(
                                                                product.price,
                                                                product.currency
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3.5">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.status ===
                                                                "ACTIVE"
                                                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                                                                }`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">
                                                        {formatDate(
                                                            product.createdAt
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    {canManage && (
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex justify-end gap-1">
                                                                <Link
                                                                    to={`/catalogue/products/${product.id}`}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                                                    title="View product"
                                                                >
                                                                    <Eye size={15} />
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            product
                                                                        )
                                                                    }
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                                                    title="Edit product"
                                                                >
                                                                    <Edit3 size={15} />

                                                                </button>

                                                                {product.status ===
                                                                    "ACTIVE" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                void handleDeactivate(
                                                                                    product
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                deletingId ===
                                                                                product.id
                                                                            }
                                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                                                            title="Deactivate product"
                                                                        >
                                                                            <Trash2
                                                                                size={15}
                                                                            />
                                                                        </button>
                                                                    )}

                                                                <button
                                                                    type="button"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
                                                                    title="More options"
                                                                >
                                                                    <MoreVertical
                                                                        size={15}
                                                                    />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* =================================================
                  MOBILE CARDS
                 ================================================= */}

                            <div className="divide-y divide-[var(--color-border)] md:hidden">
                                {filteredProducts.map(
                                    (product) => (
                                        <div
                                            key={product.id}
                                            className="p-4 transition hover:bg-[var(--color-surface-hover)]"
                                        >
                                            <div className="flex gap-3">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="h-14 w-14 shrink-0 rounded-xl border border-[var(--color-border)] object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                                                        {getInitials(
                                                            product.name
                                                        )}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                                                {product.name}
                                                            </p>

                                                            <p className="mt-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                                                                {product.sku}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${product.status ===
                                                                "ACTIVE"
                                                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                                                                }`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[10px] text-[var(--color-text-muted)]">
                                                                Category
                                                            </p>

                                                            <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                                                                {product.categoryName ||
                                                                    "—"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] text-[var(--color-text-muted)]">
                                                                Price
                                                            </p>

                                                            <p className="mt-0.5 text-xs font-semibold text-[var(--color-text)]">
                                                                {formatPrice(
                                                                    product.price,
                                                                    product.currency
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {product.description && (
                                                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                                                            {product.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <span className="text-[10px] text-[var(--color-text-muted)]">
                                                            Added{" "}
                                                            {formatDate(
                                                                product.createdAt
                                                            )}
                                                        </span>

                                                        {canManage && (
                                                            <div className="flex gap-1">
                                                                <Link
                                                                    to={`/catalogue/products/${product.id}`}
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                                                    title="View product"
                                                                >
                                                                    <Eye size={15} />
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            product
                                                                        )
                                                                    }
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                                                    title="Edit product"
                                                                >
                                                                    <Edit3 size={15} />
                                                                </button>

                                                                {product.status ===
                                                                    "ACTIVE" && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                void handleDeactivate(
                                                                                    product
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                deletingId ===
                                                                                product.id
                                                                            }
                                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                                                            title="Deactivate product"
                                                                        >
                                                                            <Trash2
                                                                                size={15}
                                                                            />
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
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
                    <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] sm:max-w-xl sm:rounded-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                            <div>
                                <h3 className="text-base font-semibold text-[var(--color-text)]">
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h3>

                                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                    {editingProduct
                                        ? "Update product information"
                                        : "Add a new product to your catalogue"}
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
                            {/* Name + SKU */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) =>
                                            handleChange(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. Premium Shoes"
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                        SKU
                                    </label>

                                    <input
                                        type="text"
                                        value={form.sku}
                                        onChange={(event) =>
                                            handleChange(
                                                "sku",
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. SHOES-001"
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                    />
                                </div>
                            </div>

                            {/* Price + Currency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(event) =>
                                            handleChange(
                                                "price",
                                                event.target.value
                                            )
                                        }
                                        placeholder="0.00"
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                        Currency
                                    </label>

                                    <select
                                        value={form.currency}
                                        onChange={(event) =>
                                            handleChange(
                                                "currency",
                                                event.target.value
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                    >
                                        <option value="INR">
                                            INR — ₹
                                        </option>

                                        <option value="USD">
                                            USD — $
                                        </option>

                                        <option value="EUR">
                                            EUR — €
                                        </option>

                                        <option value="GBP">
                                            GBP — £
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                    Category
                                </label>

                                <select
                                    value={form.categoryId}
                                    onChange={(event) =>
                                        handleChange(
                                            "categoryId",
                                            event.target.value
                                        )
                                    }
                                    disabled={categoriesLoading}
                                    className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <option value="">
                                        {categoriesLoading
                                            ? "Loading categories..."
                                            : "Select category"}
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {!categoriesLoading &&
                                    categories.length === 0 && (
                                        <p className="mt-1.5 text-[10px] text-[var(--color-danger)]">
                                            No active categories available.
                                            Create an active category first.
                                        </p>
                                    )}
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                    Image URL
                                </label>

                                <div className="relative">
                                    <ImageIcon
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                                    />

                                    <input
                                        type="url"
                                        value={form.imageUrl}
                                        onChange={(event) =>
                                            handleChange(
                                                "imageUrl",
                                                event.target.value
                                            )
                                        }
                                        placeholder="https://example.com/product.jpg"
                                        className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                                    Description
                                </label>

                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        handleChange(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe your product..."
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
                                disabled={
                                    saving ||
                                    categoriesLoading ||
                                    categories.length === 0
                                }
                                className="h-10 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingProduct
                                        ? "Save Changes"
                                        : "Add Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}