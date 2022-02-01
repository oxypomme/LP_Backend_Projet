// import type { StatusCodes } from "http-status-code";

declare namespace Express {
  interface Response {
    sendError: (code: StatusCodes, error: Error | string) => Response;
    sendPayload: <T>(
      payload: T,
      name: string,
      links?: Record<string, { href: string }>
    ) => Response;
  }
  interface Request {
    previous: {
      params: ParamsDictionary;
      query: QueryString.ParsedQs;
      body: any;
    };
  }
}
