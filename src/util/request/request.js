import axios from "axios";
import { config } from "../configs/config";
import { store } from "@/store/store";

export const request = async (url = "", method = "get", data = {}) => {
  const token = store.getState()?.auth?.token;

  let headers = {
    Accept: "application/json",
  };

  if (data instanceof FormData) {
    headers["Content-Type"] = "multipart/form-data";
  } else {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await axios({
      url: config.bese_url + url,
      method,
      data,
      headers,
    });

    return res.data;
  } catch (error) {
    const responseError = error.response;

    if (responseError) {
      const status = responseError.status;

      if (status === 500) {
        console.error("Internal Server Error");
      }
    }

    const message = responseError.data?.message;
    const errors = responseError.data?.errors;

    return {
      error: true,
      message: message || "Something went wrong",
      errors: errors || null,
    };
  }
};
