import type { RequestHandler } from "express";
import type { StatusCodes } from "http-status-codes";
import { getReasonPhrase } from "http-status-codes";

type PaginatedQuery<T> = Partial<Record<"page" | "size", T>>;

/**
 * Format data as a standard API repsponse
 *
 * @param payload The content
 * @param name The content name
 * @param meta The options of the pagination
 * @param baseurl The base url
 *
 * @returns Formated data
 */
const buildResponse = <T extends PayloadType>(
  payload: T,
  name = "payload",
  meta: PaginatedQuery<string> = {},
  baseurl = "/"
) => {
  const data: PaginatedQuery<number> & {
    type?: string; // Type of payload
    count?: number; // Total items available
  } = {
    count: 1,
    size: 1,
  };

  let links: Record<string, { href: string } | undefined> | undefined =
    undefined;

  if (payload instanceof Object) {
    if (payload instanceof Array) {
      data.type = "collection";
      data.size = meta.size ? parseInt(meta.size) : 10;
      data.count = payload.length;

      const maxPage = Math.ceil(data.count / data.size);
      let page = meta.page ? parseInt(meta.page) : 1;
      if (page < 1) {
        page = 1;
      }
      data.page = Math.min(page, maxPage);

      payload = payload.slice(
        (data.page - 1) * data.size,
        data.page * data.size
      ) as T;

      links = {
        next:
          data.page < maxPage
            ? { href: baseurl + `?page=${data.page + 1}&size=${data.size}` }
            : undefined,
        prev:
          data.page > 1
            ? { href: baseurl + `?page=${data.page - 1}&size=${data.size}` }
            : undefined,
        last: { href: baseurl + `?page=${maxPage}&size=${data.size}` },
        first: { href: baseurl + `?page=1&size=${data.size}` },
      };
    } else {
      data.type = "resource";
    }
  } else {
    data.type = typeof payload;
  }

  return {
    ...data,
    [name]: payload,
    links,
  };
};

/**
 * Format error as a standard API repsponse
 *
 * @param code The status code of the error
 * @param error The message of the error
 *
 * @returns Formated error
 */
const buildError = (code: StatusCodes, error: Error | string) => ({
  type: "error",
  error: {
    code,
    reason: getReasonPhrase(code),
  },
  message: error instanceof Error ? error.message : error,
});

/**
 * Handler of the middleware
 *
 * @param req The request
 * @param res The response
 * @param next Call the next handler
 */
const handler: RequestHandler = (req, res, next) => {
  res.sendError = (code, error) => {
    console.error(error);
    return res.status(code).json({
      ...buildError(code, error),
      url: req.method + " " + req.originalUrl,
    });
  };
  res.sendPayload = (payload, name, links) => {
    const urls: Record<string, { href: string }> = {};
    const url = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl
    );
    if (links) {
      urls.self = { href: url.pathname };
      for (const name of links) {
        urls[name] = { href: `${url.pathname}/${name}` };
      }
    }

    const response = buildResponse(payload, name, req.query, url.pathname);
    return res.json({
      ...response,
      links: links ? urls : response.links,
    });
  };
  next();
};

export default handler;
