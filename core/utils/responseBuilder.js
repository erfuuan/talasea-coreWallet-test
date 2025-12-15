const responseBuilder = {
  success(response, data, message) {
    const res = {
      statusCode: 200,
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(200).send(res);
  },

  created(response, data, message) {
    const res = {
      statusCode: 201,
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(201).send(res);
  },


  internalErr(response, message) {
    const res = {
      statusCode: 500,
      error: "internal_server_error",
      message: message ? message : "Sorry!, Something went wrong",
    };
    return response.status(500).send(res);
  },


  badRequest(response, data, message) {
    const res = {
      statusCode: 400,
      error: "bad_request",
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(400).send(res);
  },

  tooManyRequests(response, data, message) {
    const res = {
      statusCode: 429,
      error: "too_many_requests",
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(429).send(res);
  },
  notFound(response, data, message) {
    const res = {
      statusCode: 404,
      error: "not_found",
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(404).send(res);
  },
  unauthorized(response, data, message) {
    const res = {
      statusCode: 401,
      error: "unauthorized",
      message: message ? message : undefined,
      data: data ? data : undefined,
    };
    return response.status(401).send(res);
  },
};

export default responseBuilder;