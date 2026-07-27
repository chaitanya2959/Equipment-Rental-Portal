import api from "./api";

export const getCategories = async ({ search = "", status = "", page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  params.append("page", page);
  params.append("limit", limit);

  const response = await api.get(`/categories?${params.toString()}`);
  return {
    categories: response?.data?.data || [],
    total: response?.data?.total || 0,
    page: response?.data?.page || page,
    limit: response?.data?.limit || limit,
    totalPages: response?.data?.totalPages || 0,
  };
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response?.data?.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response?.data?.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response?.data?.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response?.data;
};
