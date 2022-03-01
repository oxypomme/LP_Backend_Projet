import type { RequestHandler } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

type PaginatedQuery<T> = Partial<Record<"page" | "size", T>>;

const buildResponse = <T extends PayloadType>(
  payload: T,
  name = "payload",
  meta: PaginatedQuery<string> = {}
) => {
  const data: PaginatedQuery<number> & {
    type?: string; // Type of payload
    count?: number; // Total items available
  } = {
    count: 1,
    size: 1,
  };

  if (payload instanceof Object) {
    if (payload instanceof Array) {
      data.type = "collection";
      data.size = meta.size ? parseInt(meta.size) : 15;
      data.count = payload.length;

      const maxPage = Math.ceil(data.count / data.size) - 1;
      let page = meta.page ? parseInt(meta.page) : 0;
      if (page < 0) {
        page = 0;
      }
      data.page = Math.min(page, maxPage);

      payload = payload.slice(
        data.page * data.size,
        (data.page + 1) * data.size
      ) as T;
    } else {
      data.type = "resource";
    }
  } else {
    data.type = typeof payload;
  }

  return {
    ...data,
    [name]: payload,
  };
};

const buildError = (code: StatusCodes, error: Error | string) => ({
  type: "error",
  error: {
    code,
    reason: getReasonPhrase(code),
  },
  message: error instanceof Error ? error.message : error,
});

const handler: RequestHandler = (req, res, next) => {
  res.sendError = (code, error) => {
    console.error(error);
    return res.status(code).json({
      ...buildError(code, error),
      url: req.method + " " + req.originalUrl,
    });
  };
  res.sendPayload = (payload, name, links) => {
    const baseURL = req.protocol + "://" + req.get("host") + req.originalUrl;

    const urls: Record<string, { href: string }> = {};
    if (links) {
      urls.self = { href: baseURL };
      for (const name of links) {
        urls[name] = { href: `${baseURL}/${name}` };
      }
    }

    return res.json({
      ...buildResponse(payload, name, req.query),
      links: links ? urls : undefined,
    });
  };
  next();
};

export default handler;
