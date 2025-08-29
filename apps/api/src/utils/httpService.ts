import { httpStatus, httpStatusCode } from "@customtype/http";
import logger from "@utils/logger";
import axios, { AxiosResponse } from "axios";
import { API_KEY } from ".";

class HttpService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async pushToWebsite(
    websiteUrl: string,
    method: string,
    data = {},
    customUrl?: string,
  ) {
    try {
      const url = customUrl
        ? `${websiteUrl}${customUrl}`
        : `${websiteUrl}${this.apiUrl}`;

      logger.info(`url ${url}`);
      const config = {
        method,
        headers: {
          "x-api-key": API_KEY,
        },
        url,
        ...(method !== "DELETE" && { data }), // Only include data for non-DELETE requests
      };

      const response: AxiosResponse = await axios(config);

      // Return the response data as-is, regardless of the status code
      return response.data;
    } catch (error: any) {
      // If the error is an Axios error (e.g., non-200 response), return the error response
      if (error.response) {
        return error.response.data;
      }

      // If it's a different kind of error (e.g., network error), return a generic error response
      logger.error(`Error syncing with website: ${error.message}`);
      return {
        statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
        status: httpStatus.ERROR,
        message: "Failed to sync with website backend.",
      };
    }
  }
}

export default HttpService;
