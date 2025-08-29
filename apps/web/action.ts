"use server";

import { revalidateTag } from "next/cache";
import { apiClient } from "./lib/apiClient";
import { BASE_URL } from "./lib/constant";
import { httpStatusCode } from "./types/http";

export const deleteAds = async (token: string, adId: string) => {
  const url = `/api/ads/${adId}`;
  const { message, error } = await apiClient.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return { error };
  }
  revalidateTag("ads");
  return { success: message };
};

export const editAds = async (token: string, values: any) => {
  const url = `/api/ads`;
  const { message, error } = await apiClient.put(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("ads");
  return { success: message };
};

export const deleteAdmins = async (token: string, values: any) => {
  const url = `/api/admins`;
  const { message, error } = await apiClient.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("admins");
  return { success: message };
};

export const changeRole = async (token: string, values: any) => {
  const url = `/api/admins/change/role`;
  const { message, error } = await apiClient.put(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("admins");
  return { success: message };
};

export const addAdmin = async (token: string, values: any) => {
  const url = `/api/auth/register`;
  const { message, error } = await apiClient.post(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("admins");
  return { success: message };
};

export const unpublishArticle = async (token: string, data: any) => {
  const url = `/api/articles/unpublish`;
  const { message, error } = await apiClient.post(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (error) {
    return { error };
  }
  revalidateTag("articles");
  return { success: message };
};

export const publishArticle = async (token: string, data: any) => {
  const response = await fetch(`${BASE_URL}/api/articles/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });
  const { statusCode, message } = await response.json();
  if (statusCode !== httpStatusCode.OK) {
    return { error: message };
  } else {
    revalidateTag("articles");
    return { success: message };
  }
};

export const deleteArticle = async (token: string, articleId: string) => {
  const url = `/api/articles/${articleId}`;
  const { message, error } = await apiClient.delete(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (error) {
    return { error };
  }
  revalidateTag("articles");
  return { success: message };
};

export const updateArticle = async (token: string, values: any) => {
  const response = await fetch(`${BASE_URL}/api/articles`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: values,
  });
  const { statusCode, message } = await response.json();
  if (statusCode !== httpStatusCode.OK) {
    return { error: message };
  } else {
    revalidateTag("articles");
    return { success: message };
  }
};

export const addArticle = async (token: string, values: any) => {
  const response = await fetch(`${BASE_URL}/api/articles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: values,
  });
  const { statusCode, message } = await response.json();
  if (statusCode !== httpStatusCode.OK) {
    return { error: message };
  } else {
    revalidateTag("articles");
    return { success: message };
  }
};

export const upateWebsites = async (token: string, values: any) => {
  const url = `/api/websites`;
  const { message, error } = await apiClient.put(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("websites");
  return { success: message };
};

export const addWebsites = async (token: string, values: any) => {
  const url = `/api/websites`;
  const { message, error } = await apiClient.post(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (error) {
    return { error };
  }
  revalidateTag("websites");
  return { success: message };
};
