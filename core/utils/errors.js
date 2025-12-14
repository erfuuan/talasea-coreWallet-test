export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(msg) { super(msg, 404); }
  }
  
  export class BadRequestError extends AppError {
    constructor(msg) { super(msg, 400); }
  }
  
  export class ConflictError extends AppError {
    constructor(msg) { super(msg, 409); }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(msg) { super(msg, 401); }
  }
  