import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  ImageOff,
  Package,
  Tag,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getProductById,
  type Product,
} from "../../api/productApi";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [showImage, setShowImage] =
    useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getProductById(
          Number(id)
        );

        setProduct(data);
      } catch (err) {
        console.error(
          "Failed to load product:",
          err
        );

        setError(
          "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)]">
          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            <div className="aspect-square animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />

            <div className="space-y-4">
              <div className="h-7 w-2/3 animate-pulse rounded bg-[var(--color-surface-muted)]" />
              <div className="h-5 w-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />
              <div className="h-4 w-full animate-pulse rounded bg-[var(--color-surface-muted)]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !product) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-danger-light)] text-[var(--color-danger)]">
          <Package size={25} />
        </div>

        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          Product not found
        </h2>

        <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
          {error ||
            "The requested product could not be found."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/catalogue/products")
          }
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)]"
        >
          <ArrowLeft size={15} />
          Back to Products
        </button>
      </div>
    );
  }

  /*
   * =========================================================
   * FORMAT PRICE
   * =========================================================
   */

  const formattedPrice =
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency || "INR",
      maximumFractionDigits: 2,
    }).format(product.price);

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <>
      <div className="space-y-5">
        {/* ===================================================
            TOP BAR
           =================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() =>
              navigate("/catalogue/products")
            }
            className="inline-flex w-fit items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={15} />
            Back to Products
          </button>

          <Link
            to={`/catalogue/products?edit=${product.id}`}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            <Edit3 size={14} />
            Edit Product
          </Link>
        </div>

        {/* ===================================================
            PRODUCT MAIN CARD
           =================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          <div className="grid lg:grid-cols-[minmax(320px,440px)_1fr]">
            {/* =================================================
                IMAGE
               ================================================= */}

            <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] p-5 lg:border-b-0 lg:border-r">
              <div
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                onClick={() => {
                  if (product.imageUrl) {
                    setShowImage(true);
                  }
                }}
              >
                {product.imageUrl ? (
                  <>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.25)] to-transparent opacity-0 transition group-hover:opacity-100">
                      <span className="p-4 text-xs font-medium text-[var(--color-text-inverse)]">
                        Click to preview
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-[var(--color-text-muted)]">
                    <ImageOff size={35} />

                    <p className="mt-2 text-xs">
                      No product image
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                DETAILS
               ================================================= */}

            <div className="p-5 sm:p-7">
              {/* Status */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    product.status === "ACTIVE"
                      ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.status === "ACTIVE"
                        ? "bg-[var(--color-success)]"
                        : "bg-[var(--color-text-muted)]"
                    }`}
                  />

                  {product.status}
                </span>

                {product.categoryName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-primary)]">
                    <Tag size={11} />
                    {product.categoryName}
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
                {product.name}
              </h1>

              {/* SKU */}
              <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
                SKU: {product.sku}
              </p>

              {/* Price */}
              <div className="mt-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                  Price
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text)]">
                  {formattedPrice}
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-[var(--color-border)]" />

              {/* Quick Details */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    Currency
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {product.currency}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    Category
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-[var(--color-text)]">
                    {product.categoryName ||
                      "Uncategorized"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                    {product.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              DESCRIPTION
             ================================================= */}

          <div className="border-t border-[var(--color-border)] p-5 sm:p-7">
            <div className="max-w-3xl">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Description
              </h2>

              {product.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                  {product.description}
                </p>
              ) : (
                <p className="mt-2 text-sm italic text-[var(--color-text-muted)]">
                  No description added for this
                  product.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            PRODUCT INFORMATION
           =================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Package size={15} />
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Product Information
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Product ID
                </span>

                <span className="font-mono text-xs font-medium text-[var(--color-text-secondary)]">
                  #{product.id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--color-text-muted)]">
                  SKU
                </span>

                <span className="font-mono text-xs font-medium text-[var(--color-text-secondary)]">
                  {product.sku}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Category
                </span>

                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {product.categoryName ||
                    "Uncategorized"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-whatsapp-light)] text-[var(--color-whatsapp)]">
                <Tag size={15} />
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Catalogue Status
              </h3>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Visibility
                </span>

                <span
                  className={`text-xs font-semibold ${
                    product.status === "ACTIVE"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {product.status === "ACTIVE"
                    ? "Visible"
                    : "Hidden"}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className={`h-full rounded-full ${
                    product.status === "ACTIVE"
                      ? "w-full bg-[var(--color-success)]"
                      : "w-1/4 bg-[var(--color-text-muted)]"
                  }`}
                />
              </div>

              <p className="mt-2 text-[10px] leading-4 text-[var(--color-text-muted)]">
                Active products can later be used
                in WhatsApp catalogue and automation
                flows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          IMAGE PREVIEW
         ===================================================== */}

      {showImage && product.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowImage(false)}
        >
          <div
            className="relative max-h-[90dvh] max-w-5xl overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() => setShowImage(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition hover:text-[var(--color-danger)]"
            >
              <X size={18} />
            </button>

            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[90dvh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}