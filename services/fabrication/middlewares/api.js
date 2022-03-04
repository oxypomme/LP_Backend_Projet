import { getReasonPhrase } from "http-status-codes";

/**
 * Format data as a standard API repsponse
 *
 * @param {*} payload The content
 * @param {string} name The content name
 * @param {Record<string, string>} meta The options of the pagination
 *
 * @returns Formated data
 */
const buildResponse = (
  payload,
  name = "payload",
  meta = {}
) => {
  const data = {
    count: 1,
    size: 1,
  };

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
      );
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
    const baseURL = req.protocol + "://" + req.get("host") + req.originalUrl;

    const urls = {};
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
