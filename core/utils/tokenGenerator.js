import jwt from "jsonwebtoken";
import config from "../config/application.js";

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;

export const buildToken = (user) =>{
 return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )};


  
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const error = new Error("Token expired");
      error.code = "TOKEN_EXPIRED"; 
      throw error;
    }
    throw err;
  }
};