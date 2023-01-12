import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
  } from 'axios';
  
  export enum Methods {
    POST = 'post',
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
  }
  
  interface ApiRespose<T> {
    data?: T;
    error?: string;
    errorData?: any;
    code: number;
  }


  
  abstract class ApiBase {
    private api: AxiosInstance;
  
    private apiToken = '';
    constructor(public readonly apiUrl: string) {
      this.api = axios.create({
        baseURL: apiUrl,
        headers: {'Content-Type': 'application/json'},
        timeout: 2000 * 180,
      });
    }

    public setApi(url: string) {
      this.api = axios.create({
        baseURL: url,
        headers: {'Content-Type': 'application/json'},
      });
    }
  
    protected baseHeaders(): Record<string, string> {
      return {
        Accept: 'application/json',
        ...(this.apiToken && {Authorization: `Bearer ${this.apiToken}`}),
      };
    }
  
    protected async apiFetchJSON<TResponse, TBody extends Record<string, any>>(
      url: string,
      requestParams: {
        params: Record<string, any>;
        headers: Record<string, any>;
        extras: string[];
      },
  
      method: Methods,
      body?: TBody,
    ): Promise<ApiRespose<TResponse>> {
      try {
        let response: AxiosResponse<TResponse, any>;
        const theMethod: Methods = method || Methods.GET;
        const config: AxiosRequestConfig<any> = {
          params: requestParams.params,
          headers: {
            ...this.baseHeaders(),
            ...(requestParams.headers || {}),
          },
        };
        let urlToGo = url;
        if (requestParams.extras.length > 0) {
          const d = requestParams.extras.join('/');
          urlToGo += '/' + d;
        }
  
        switch (theMethod) {
          case Methods.DELETE:
            response = await this.api.delete<TResponse>(urlToGo, config);
            break;
          case Methods.POST:
            response = await this.api.post<TResponse, any, TBody>(
              urlToGo,
              body,
              config,
            );
            break;
  
          case Methods.PUT:
            response = await this.api.put<TResponse>(urlToGo, body, config);
            break;
  
          case Methods.PATCH:
            response = await this.api.patch<TResponse>(urlToGo, body, config);
            break;
          default:
            response = await this.api.get<TResponse>(urlToGo, config);
            break;
        }
  
        return {data: response.data, code: response.status};
      } catch (err: any) {
        if (err.response) {
          return {
            errorData: err.response.data,
            code: (err as AxiosError).response!.status,
            error: err.message,
          };
        }
        return {
          error: err.message,
          errorData: {message: err.message},
          code: -1,
        };
      }
    }

    protected createGenericFetch<TResponse, TBody extends Record<string, any>>(
      url: string,
      method: Methods = Methods.POST,
    ) {
      return async (
        params?: Record<string, any>,
        headers?: Record<string, any>,
        body?: TBody,
        extras?: string[],
      ) => {
        params = params || {};
        headers = headers || {};
        extras = extras || [];
        return this.apiFetchJSON<TResponse, TBody>(
          url,
          {params, headers, extras},
          method,
          body,
        );
      };
    }
  }
  
  export default ApiBase;
  