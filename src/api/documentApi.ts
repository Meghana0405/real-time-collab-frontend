import { api } from "./axios";

export const getDocuments = async (page = 1) => {
  const response = await api.get(`/documents?page=${page}`);
  return response.data;
};
