import api from "./axios";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: number;
  organizationId: number | null;

  name: string;
  description: string | null;

  price: number;
  currency: string;

  imageUrl: string | null;
  sku: string;

  status: ProductStatus;

  categoryId: number | null;
  categoryName: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  sku: string;
  categoryId?: number;
}

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");

  return response.data;
};

/**
 * Get active products
 */
export const getActiveProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    "/products/active"
  );

  return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (
  productId: number
): Promise<Product> => {
  const response = await api.get<Product>(
    `/products/${productId}`
  );

  return response.data;
};

/**
 * Create product
 */
export const createProduct = async (
  request: ProductRequest
): Promise<Product> => {
  const response = await api.post<Product>(
    "/products",
    request
  );

  return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (
  productId: number,
  request: ProductRequest
): Promise<Product> => {
  const response = await api.put<Product>(
    `/products/${productId}`,
    request
  );

  return response.data;
};

/**
 * Deactivate product
 */
export const deactivateProduct = async (
  productId: number
): Promise<void> => {
  await api.delete(`/products/${productId}`);
};