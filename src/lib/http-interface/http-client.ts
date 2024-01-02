import { ajax, AjaxResponse } from "rxjs/ajax";
import type { AjaxConfig } from "rxjs/ajax";
import { auditTime, catchError, iif, lastValueFrom, Observable, retry, Subject, timer } from "rxjs";
import { BASE_URL as baseUrl, HTTP_RESPONSE_DELAY } from "../../global-config";
import { notUAN, typeIsArray, typeIsObject } from "@siaikin/utils";

const includeHostRegexp = /^http[s]?:\/\//;

export class HttpClient {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private systemErrorSubject = new Subject<ResponseInternalError>();

  baseUrl: string;

  systemErrorObservable: Observable<ResponseInternalError> = this.systemErrorSubject.asObservable();

  request<T>(config: AjaxConfig, options: GetRequestOptions = {}): Promise<AjaxResponse<T>> {
    this.handleRequestConfig(config);

    const obs$ = iif(
      () => config.method === "GET" && options.retry !== false,
      ajax<T>(config).pipe(
        retry({
          count: 3,
          // 指数退避: 以请求失败次数(count)指数增长延时时长
          delay: (error, count) => {
            // 401 时不再重试
            if (error.status !== 401) return timer(2 ** (count - 1) * 500);

            throw error;
          }
        })
      ),
      ajax<T>(config)
    ).pipe(
      auditTime(HTTP_RESPONSE_DELAY),
      catchError((error) => {
        const response = error.response;

        const responseError = new ResponseInternalError(
          error.status,
          response.error || error.message
        );

        this.systemErrorSubject.next(responseError);

        throw responseError;
      })
    );

    return lastValueFrom(obs$);
  }

  async get<T>(config: Omit<AjaxConfig, "method">, options: GetRequestOptions = {}): Promise<T> {
    return (await this.request<T>({ ...config, method: "GET" }, options)).response;
  }

  async post<T = void>(config: Omit<AjaxConfig, "method">): Promise<T> {
    return (await this.request<T>({ ...config, method: "POST" })).response;
  }

  async delete(config: Omit<AjaxConfig, "method">): Promise<void> {
    await this.request({ ...config, method: "DELETE" });
  }

  async put<T>(config: Omit<AjaxConfig, "method">): Promise<T> {
    return (await this.request<T>({ ...config, method: "PUT" })).response;
  }

  async patch<T>(config: Omit<AjaxConfig, "method">): Promise<T> {
    return (await this.request<T>({ ...config, method: "PATCH" })).response;
  }

  /**
   * 使用 navigator.sendBeacon 发送请求
   * @param config
   */
  sendBeacon(config: Omit<AjaxConfig, "method">): boolean {
    this.handleRequestConfig(config);

    console.log(config);
    return navigator.sendBeacon(config.url, JSON.stringify(config.body));
  }

  protected handleRequestConfig(config: AjaxConfig): void {
    config.withCredentials = true;

    if (!includeHostRegexp.test(config.url)) {
      const url = config.url;

      config.url = `${this.baseUrl}/${config.url.startsWith("/") ? url.slice(1) : url}`;
    }

    if (notUAN(config.queryParams) && typeIsObject(config.queryParams)) {
      const searchParams = new URLSearchParams();
      const keys = Object.keys(config.queryParams);
      for (let i = keys.length; i--; ) {
        const key = keys[i];
        const value = config.queryParams[key];

        (typeIsArray(value) ? value : [value]).forEach((v) =>
          searchParams.append(key, v.toString())
        );
      }

      config.queryParams = searchParams.toString();
    }
  }
}

export class ResponseInternalError extends Error {
  constructor(httpStatus: number, message: string) {
    super(message);

    this.httpStatus = httpStatus;
  }

  httpStatus: number;
}

export type GetRequestOptions = Partial<{
  retry: boolean;
}>;
export const httpClient = new HttpClient(baseUrl);
