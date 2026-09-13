import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

export class AxiosHttpClient {
  private readonly client: AxiosInstance;

  constructor(config?: AxiosRequestConfig, client: AxiosInstance = axios.create(config)) {
    this.client = client;
  }

  request<TResponse = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<TResponse>> {
    return this.client.request<TResponse>(config);
  }

  get<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return this.client.get<TResponse>(url, config);
  }

  post<TResponse = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return this.client.post<TResponse>(url, data, config);
  }

  put<TResponse = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return this.client.put<TResponse>(url, data, config);
  }

  patch<TResponse = unknown, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return this.client.patch<TResponse>(url, data, config);
  }

  delete<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return this.client.delete<TResponse>(url, config);
  }
}