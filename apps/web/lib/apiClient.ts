import { BASE_URL } from "./constant";
import { httpStatus, httpStatusCode } from "@/types/http";

interface Request<T> {
  statusCode: httpStatusCode;
  status: httpStatus;
  data?: T;
  message?: string;
  error?: string;
}

type ExtendedRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, any>;
  baseUrl?: string; // Add baseUrl to override BASE_URL
};

export const apiClient = (() => {
  const request = async <T = any>(
    url: string,
    options: ExtendedRequestInit = {},
  ): Promise<Request<T>> => {
    try {
      const { body, baseUrl, ...restOptions } = options;

      // Use custom baseUrl if provided, otherwise fallback to BASE_URL
      const fullUrl = `${baseUrl || BASE_URL}${url}`;

      const parsedBody =
        body && typeof body === "object" && !(body instanceof FormData)
          ? JSON.stringify(body)
          : body;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      const fetchOptions: RequestInit = {
        ...restOptions,
        body: parsedBody,
        headers,
      };

      const response = await fetch(fullUrl, fetchOptions);
      const { data, statusCode, status, message } = await response.json();

      if (statusCode !== httpStatusCode.OK || status !== httpStatus.SUCCESS) {
        return { statusCode, status, error: message };
      }

      return { data, message, status, statusCode };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.info("Request was aborted");
        return {
          error: "Request was aborted",
          status: httpStatus.FAIL,
          statusCode: httpStatusCode.UNPROCESSABLE_ENTITY,
        };
      }

      return {
        error: (error as Error).message || "An unknown error occurred",
        statusCode: httpStatusCode.UNPROCESSABLE_ENTITY,
        status: httpStatus.FAIL,
      };
    }
  };

  return {
    async get<T = any>(url: string, options?: ExtendedRequestInit) {
      return request<T>(url, { ...options, method: "GET" });
    },

    async post<T = any>(url: string, options?: ExtendedRequestInit) {
      return request<T>(url, { ...options, method: "POST" });
    },

    async put<T = any>(url: string, options?: ExtendedRequestInit) {
      return request<T>(url, { ...options, method: "PUT" });
    },

    async patch<T = any>(url: string, options?: ExtendedRequestInit) {
      return request<T>(url, { ...options, method: "PATCH" });
    },

    async delete<T = any>(url: string, options?: ExtendedRequestInit) {
      return request<T>(url, { ...options, method: "DELETE" });
    },
  };
})();
