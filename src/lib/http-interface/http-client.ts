import { ajax, AjaxResponse } from "rxjs/ajax";
import type { AjaxConfig } from "rxjs/ajax";
import { auditTime, catchError, iif, lastValueFrom, Observable, retry, Subject, timer } from "rxjs";
import { BASE_URL as baseUrl, HTTP_RESPONSE_DELAY } from "../../global-config";

const includeHostRegexp = /^http[s]?:\/\//;

export class HttpClient {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private systemErrorSubject = new Subject<ResponseInternalError>();

  baseUrl: string;

  systemErrorObservable: Observable<ResponseInternalError> = this.systemErrorSubject.asObservable();

  request<T>(config: AjaxConfig): Promise<AjaxResponse<T>> {
    config.withCredentials = true;

    if (!includeHostRegexp.test(config.url)) {
      const url = config.url;

      config.url = `${this.baseUrl}/${config.url.startsWith("/") ? url.slice(1) : url}`;
    }

    const obs$ = iif(
      () => config.method === "GET",
      ajax<T>(config).pipe(
        retry({
          count: 3,
          // 指数退避: 以请求失败次数(count)指数增长延时时长
          delay: (error, count) => {
            // 401 时不再重试
            if (error.status !== 401) return timer(2 ** (count - 1) * 500);

            throw error;
          },
        })
      ),
      ajax<T>(config)
    ).pipe(
      auditTime(HTTP_RESPONSE_DELAY),
      // map((response) => {
      //   console.log(response);
      //   return response;
      //   // const _response = response.response;
      //   // let result;
      //   //
      //   // if (!result) throw new Error(`response is undefined`);
      //   //
      //   // if (result.success) {
      //   //   return result;
      //   // } else {
      //   //   throw new HTTPInnerError(`${result.errorMsg}`, result.code);
      //   // }
      // }),
      catchError((error) => {
        const response = error.response;

        const responseError = new ResponseInternalError(
          error.status,
          response.error || error.message
        );

        this.systemErrorSubject.next(responseError);

        throw responseError;

        // const message = `[${typeIsNumber(response.code) ? response.code : "UNKNOWN"}] ${
        //   response.message
        // }`;
      })
    );

    return lastValueFrom(obs$);
  }

  async get<T>(config: Omit<AjaxConfig, "method">): Promise<T> {
    return (await this.request<T>({ ...config, method: "GET" })).response;
  }

  async post<T>(config: Omit<AjaxConfig, "method">): Promise<void> {
    await this.request<T>({ ...config, method: "POST" });
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
}

export class ResponseInternalError extends Error {
  constructor(httpStatus: number, message: string) {
    super(message);

    this.httpStatus = httpStatus;
  }

  httpStatus: number;
}

export const httpClient = new HttpClient(baseUrl);
