// import type { StatusCodes } from "http-status-code";

type PayloadType =
  | Array<unknown>
  | Record<string, unknown>
  | boolean
  | number
  | string;

declare namespace Express {
  interface Response {
    sendError: (code: StatusCodes, error: Error | string) => Response;
    sendPayload: <T extends PayloadType>(
      payload: T,
      name: string,
      links?: string[]
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
