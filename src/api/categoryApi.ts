import api from "./axios";

export type CategoryStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface Category {
  id: number;
  organizationId: number | null;

  name: string;
  description: string | null;

  status: CategoryStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

/**
 * Get all categories
 */
export const getCategories = async (): Promise<
  Category[]
> => {
  const response = await api.get<Category[]>(
    "/categories"
  );

  return response.data;
};

/**
 * Get active categories
 */
export const getActiveCategories = async (): Promise<
  Category[]
> => {
  const response = await api.get<Category[]>(
    "/categories/active"
  );

  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (
  categoryId: number
): Promise<Category> => {
  const response = await api.get<Category>(
    `/categories/${categoryId}`
  );

  return response.data;
};

/**
 * Create category
 */
export const createCategory = async (
  request: CategoryRequest
): Promise<Category> => {
  const response = await api.post<Category>(
    "/categories",
    request
  );

  return response.data;
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: number,
  request: CategoryRequest
): Promise<Category> => {
  const response = await api.put<Category>(
    `/categories/${categoryId}`,
    request
  );

  return response.data;
};

/**
 * Deactivate category
 */
export const deactivateCategory = async (
  categoryId: number
): Promise<void> => {
  await api.delete(`/categories/${categoryId}`);
};