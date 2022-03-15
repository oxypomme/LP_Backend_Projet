"use strict";

import { getReasonPhrase } from "http-status-codes";

/**
 * Format data as a standard API repsponse
 *
 * @param {*} payload The content
 * @param {string} name The content name
 * @param {Record<string, string>} meta The options of the pagination
 * @param {string} baseurl Current URI
 *
 * @returns Formated data
 */
const buildResponse = (
  payload,
  name = "payload",
  meta = {},
  baseurl = "/"
) => {
  const data = {
    count: 1,
    size: 1,
  };

  let links = undefined;

  if (payload instanceof Object) {
    if (payload instanceof Array) {
      if(meta.s) {
        payload = payload.filter((o) => !o.status || o.status === parseInt(meta.s));
      }

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
      ).map((o) => ({
        ...o,
        links: {
          self: { href: baseurl + (o.id ?? "")}
        }
      }));

      links = {
        next: data.page < maxPage ? { href: baseurl + `?page=${data.page + 1}&size=${data.size}` } : undefined,
        prev: data.page > 1 ? { href: baseurl + `?page=${data.page - 1}&size=${data.size}` } : undefined,
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
    links
  };
};


/**
 * Format error as a standard API repsponse
 *
 * @param {number} code The status code of the error
 * @param {Error|string} error The message of the error
 *
 * @returns Formated error
 */
const buildError = (code, error) => ({
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
 * @param {Express.Request} req The request
 * @param {Express.Result} res The response
 * @param {Express.RequestHandler} next Call the next handler
 */
const handler = (req, res, next) => {
  res.sendError = (code, error) => {
    console.error(error);
    return res.status(code).json({
      ...buildError(code, error),
      url: req.method + " " + req.originalUrl,
    });
  };
  res.sendPayload = (payload, name, links) => {
    const urls = {};
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
