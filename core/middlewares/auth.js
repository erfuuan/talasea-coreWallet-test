import responseBuilder from "../utils/responseBuilder.js";
import { verifyToken } from "../utils/tokenGenerator.js";

const authMiddleware = (req, res, next) => {
 try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (!token || scheme?.toLowerCase() !== "bearer") {
      return responseBuilder.unauthorized(res, null, "Missing or invalid authorization header");
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    if (err.code === "TOKEN_EXPIRED") {
      return responseBuilder.unauthorized(res, null, "Token expired"); // ۴۰۱
    }
    console.error("Auth middleware error:", err);
    return responseBuilder.internalErr(res, null, "Invalid or expired token"); // ۵۰۰ فقط برای بقیه خطاها
  }
};
export default authMiddleware;