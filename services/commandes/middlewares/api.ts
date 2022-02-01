import type { RequestHandler } from "express";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

const buildResponse = <T>(payload: T, name: string = "payload") => {
  const data: {
    type?: string;
    count?: number;
  } = {};

  if (payload instanceof Object) {
    if (payload instanceof Array) {
      data.type = "collection";
      data.count = payload.length;
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
  res.sendPayload = (payload, name, links) =>
    res.json({
      ...buildResponse(payload, name),
      links: links ?? undefined,
    });
  next();
};

export default handler;
